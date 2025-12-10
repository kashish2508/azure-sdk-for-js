// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
  getTestRunApiUrl,
  getAccessToken,
  extractErrorMessage,
  exitWithFailureMessage,
} from "./utils.js";
import { HttpService } from "../common/httpService.js";
import { TestRunCreatePayload } from "../common/types.js";
import { ServiceErrorMessageConstants } from "../common/messages.js";
import { Constants } from "../common/constants.js";
import { BlobServiceClient } from "@azure/storage-blob";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { PlaywrightServiceConfig } from "../common/playwrightServiceConfig.js";

/**
 * Makes a PATCH call to the Playwright workspaces Test Run API to create or update a test run.
 *
 * @param payload - The request payload (displayName, config, ciConfig, etc.).
 * @returns The parsed JSON response from the API.
 * @throws If the API call fails (non-2xx response).
 */
export class PlaywrightServiceApiCall {
  private httpService: HttpService;

  constructor(httpService?: HttpService) {
    this.httpService = httpService ?? new HttpService();
  }

  async patchTestRunAPI(payload: TestRunCreatePayload): Promise<any> {
    const baseUrl = getTestRunApiUrl();
    const token = getAccessToken();
    if (!token) {
      throw new Error("PLAYWRIGHT_SERVICE_ACCESS_TOKEN environment variable is not set.");
    }
    const url = new URL(baseUrl);
    url.searchParams.set("api-version", Constants.LatestAPIVersion);
    const method = "PATCH";
    const data = JSON.stringify(payload);
    const contentType = "application/merge-patch+json";
    const correlationId = crypto.randomUUID();

    const response = await this.httpService.callAPI(
      method,
      url.toString(),
      data,
      token,
      contentType,
      correlationId,
    );
    if (response.status !== 200) {
      const errorMessage = extractErrorMessage(response?.bodyAsText ?? "");
      exitWithFailureMessage(ServiceErrorMessageConstants.FAILED_TO_CREATE_TEST_RUN, errorMessage);
    }
    console.log("Test run created successfully.");
    return response.bodyAsText ? JSON.parse(response.bodyAsText) : {};
  }

  /**
   * Uploads the entire HTML report folder to Azure Storage with parallel file uploads for better performance.
   *
   * @param credential - The DefaultAzureCredential from options.credential
   * @param runId - The test run ID to use as container name
   * @param outputFolder - The path to the output folder to upload
   * @returns Promise<string> - The URL of the uploaded container
   */
  private async uploadHtmlReportFolder(
    credential: any,
    runId: string,
    outputFolder: string,
  ): Promise<void> {
    const account = "2002kash"; //for now will update once API is available.
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      credential,
    );

    const serviceUrlInfo = this.getWorkspaceInfoFromServiceUrl();
    if (!serviceUrlInfo?.accountId) {
      throw new Error("Unable to extract workspace ID from service URL");
    }

    const containerName = serviceUrlInfo.accountId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const containerExists = await containerClient.exists();
    if (!containerExists) {
      await containerClient.create();
      console.log(`Created new container: ${containerName}`);
    } else {
      console.log(`Using existing container: ${containerName}`);
    }

    console.log(`Creating folder: ${runId}`);
    const uploadedFiles = await this.uploadFolderInParallel(
      containerClient,
      outputFolder,
      outputFolder,
      runId,
    );

    console.log(`Successfully uploaded ${uploadedFiles.length} files`);
  }

  /**
   * Uploads the entire Playwright HTML report folder after tests complete.
   */
  async uploadPlaywrightHtmlReportAfterTests(outputFolderName?: string): Promise<void> {
    const cred = PlaywrightServiceConfig.instance.credential;
    if (!cred) {
      throw new Error("No Azure credential available for HTML report upload");
    }

    const folderName = outputFolderName || "playwright-report";
    const outputFolderPath = join(process.cwd(), folderName);

    if (!existsSync(outputFolderPath)) {
      throw new Error(`HTML report folder not found: ${folderName}`);
    }

    const testRunId = PlaywrightServiceConfig.instance.runId;
    await this.uploadHtmlReportFolder(cred, testRunId, outputFolderPath);
  }

  /**
   * Uploads all files from a folder to Azure Blob Storage with optimal parallel processing.
   * Uses adaptive concurrency, streaming for large files, and retry logic.
   *
   * @param containerClient - The Azure container client
   * @param folderPath - The local folder path to upload
   * @param basePath - The base path for calculating relative blob names
   * @param runIdFolderPrefix - Optional runId to create folder structure in container
   * @returns Promise<string[]> - Array of uploaded blob names
   */
  private async uploadFolderInParallel(
    containerClient: any,
    folderPath: string,
    basePath: string,
    runIdFolderPrefix?: string,
  ): Promise<string[]> {
    const filesToUpload = this.collectAllFiles(folderPath, basePath, runIdFolderPrefix).sort(
      (a, b) => a.size - b.size,
    );

    if (filesToUpload.length === 0) {
      return [];
    }

    const concurrency = this.calculateOptimalConcurrency(filesToUpload);
    const results = await this.uploadWithConcurrencyControl(
      containerClient,
      filesToUpload,
      concurrency,
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      throw new Error(`Upload failed: ${failed} files could not be uploaded`);
    }

    return results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);
  }

  /**
   * Uploads files with controlled concurrency using a semaphore-like approach.
   */
  private async uploadWithConcurrencyControl(
    containerClient: any,
    files: Array<{ fullPath: string; relativePath: string; size: number; contentType: string }>,
    concurrency: number,
  ): Promise<PromiseSettledResult<string>[]> {

    // Create a queue of upload tasks
    const uploadTasks = files.map((fileInfo) => async (): Promise<string> => {
      try {
        await this.uploadSingleFileOptimized(containerClient, fileInfo);
        return fileInfo.relativePath;
      } catch (error) {
        throw new Error(
          `${fileInfo.relativePath}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

    // Execute with controlled concurrency and batch progress reporting
    return this.executeWithConcurrency(uploadTasks, concurrency);
  }

  private async executeWithConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    concurrency: number,
  ): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = [];

    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      const batchPromises = batch.map((task) => task());
      const batchResults = await Promise.allSettled(batchPromises);

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Calculates optimal concurrency based on file characteristics.
   * Never exceeds the number of files to avoid wasted workers.
   */
  private calculateOptimalConcurrency(files: Array<{ size: number }>): number {
    const totalFiles = files.length;
    const avgFileSize = files.reduce((sum, f) => sum + f.size, 0) / totalFiles;
    const largeFiles = files.filter((f) => f.size > 1024 * 1024).length; // Files > 1MB

    let optimalConcurrency: number;

    // Adaptive concurrency based on file characteristics
    if (totalFiles <= 10) {
      optimalConcurrency = Math.min(totalFiles, 5);
    } else if (largeFiles > totalFiles * 0.3) {
      optimalConcurrency = 5; // Many large files - lower concurrency
    } else if (avgFileSize < 100 * 1024) {
      optimalConcurrency = 15; // Small files - higher concurrency
    } else if (totalFiles > 100) {
      optimalConcurrency = 12; // Many files - moderate concurrency
    } else {
      optimalConcurrency = 8; // Default
    }

    // Never use more workers than files (prevents wasted workers)
    return Math.min(optimalConcurrency, totalFiles);
  }

  /**
   * Recursively collects all files from a directory structure.
   *
   * @param folderPath - The folder to scan
   * @param basePath - The base path for calculating relative paths
   * @param runIdFolderPrefix - Optional runId to prefix blob paths for folder structure
   * @returns Array of file information objects
   */
  private collectAllFiles(
    folderPath: string,
    basePath: string,
    runIdFolderPrefix?: string,
  ): Array<{
    fullPath: string;
    relativePath: string;
    size: number;
    contentType: string;
  }> {
    const files: Array<{
      fullPath: string;
      relativePath: string;
      size: number;
      contentType: string;
    }> = [];

    const stack = [folderPath];

    while (stack.length > 0) {
      const currentPath = stack.pop()!;

      try {
        const items = readdirSync(currentPath);

        for (const item of items) {
          const itemPath = join(currentPath, item);
          const stats = statSync(itemPath);

          if (stats.isDirectory()) {
            stack.push(itemPath); // Add directory to stack instead of recursing
          } else {
            // Simplified path calculation - normalize separators once
            let relativePath = relative(basePath, itemPath).split("\\").join("/");

            // If runIdFolderPrefix is provided, prepend it to create folder structure
            if (runIdFolderPrefix) {
              relativePath = `${runIdFolderPrefix}/${relativePath}`;
            }

            files.push({
              fullPath: itemPath,
              relativePath,
              size: stats.size,
              contentType: this.getContentType(itemPath),
            });
          }
        }
      } catch (error) {
        // Skip directories we can't read (permissions, etc.)
        continue;
      }
    }

    return files;
  }

  /**
   * Optimized single file upload with streaming for large files and retry logic.
   *
   * @param containerClient - The Azure container client
   * @param fileInfo - File information object
   */
  private async uploadSingleFileOptimized(
    containerClient: any,
    fileInfo: { fullPath: string; relativePath: string; contentType: string; size: number },
  ): Promise<void> {
    const blockBlobClient = containerClient.getBlockBlobClient(fileInfo.relativePath);
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use streaming for larger files (> 4MB) to reduce memory usage
        if (fileInfo.size > 4 * 1024 * 1024) {
          const { createReadStream } = await import("fs");
          const stream = createReadStream(fileInfo.fullPath);

          await blockBlobClient.uploadStream(
            stream,
            undefined, // Let Azure SDK determine buffer size
            undefined, // Let Azure SDK determine max buffers
            {
              blobHTTPHeaders: {
                blobContentType: fileInfo.contentType,
              },
              // Optimize for throughput
              conditions: undefined,
              onProgress: undefined,
            },
          );
        } else {
          // For smaller files, use direct buffer upload
          const fileContent = readFileSync(fileInfo.fullPath);
          await blockBlobClient.upload(fileContent, fileContent.length, {
            blobHTTPHeaders: {
              blobContentType: fileInfo.contentType,
            },
          });
        }

        // Success - exit retry loop
        return;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (isLastAttempt) {
          throw new Error(`Failed after ${maxRetries} attempts: ${errorMessage}`);
        }

        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Determines the content type based on file extension.
   *
   * @param filePath - The file path
   * @returns The MIME type
   */
  private getContentType(filePath: string): string {
    const ext = filePath.toLowerCase().split(".").pop();

    const contentTypes: { [key: string]: string } = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      svg: "image/svg+xml",
      ico: "image/x-icon",
      txt: "text/plain",
      ttf: "font/ttf",
      woff: "font/woff",
      woff2: "font/woff2",
      webmanifest: "application/manifest+json",
      map: "application/json",
      xml: "application/xml",
      pdf: "application/pdf",
      zip: "application/zip",
    };

    return contentTypes[ext || ""] || "application/octet-stream";
  }

  /**
   * Extracts workspace information from the service URL.
   *
   * @returns Object containing region, domain, and accountId from service URL
   */
  private getWorkspaceInfoFromServiceUrl(): {
    region: string;
    domain: string;
    accountId: string;
  } | null {
    // Service URL format: wss://<region>.api.playwright.microsoft.com/accounts/<workspace-id>/browsers
    const url = process.env["PLAYWRIGHT_SERVICE_URL"];
    if (url) {
      const parts = url.split("/");

      if (parts.length > 2) {
        const subdomainParts = parts[2]!.split(".");
        const region = subdomainParts.length > 0 ? subdomainParts[0] : null;
        const domain = subdomainParts.slice(2).join(".");
        const accountId = parts[4];

        return { region: region!, domain: domain!, accountId: accountId! };
      }
    }
    return null;
  }
}
