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
    console.log("kkkkkTest run created successfully.");
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
  async uploadHtmlReportFolder(
    credential: any,
    runId: string,
    outputFolder: string,
  ): Promise<string> {
    try {
      // Storage account details
      const account = "2002kash";
      const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        credential,
      );
      console.log("Initialized BlobServiceClient for account:", account);

      // Get workspace ID (accountId) from service URL to use as container name
      const serviceUrlInfo = this.getWorkspaceInfoFromServiceUrl();
      if (!serviceUrlInfo?.accountId) {
        throw new Error("Unable to extract workspace ID from service URL for container naming");
      }

      // Use workspace ID (accountId) as container name (sanitized for Azure naming requirements)
      const containerName = serviceUrlInfo.accountId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const containerClient = blobServiceClient.getContainerClient(containerName);

      // Check if container exists, create if it doesn't
      const containerExists = await containerClient.exists();
      if (!containerExists) {
        await containerClient.create();
        console.log("Created new container for workspace:", containerName);
      } else {
        console.log("Using existing container for workspace:", containerName);
      }

      // Check if output folder exists
      if (!existsSync(outputFolder)) {
        throw new Error(`Output folder not found: ${outputFolder}`);
      }

      // Upload all files in parallel for better performance with runId folder structure
      const uploadedFiles = await this.uploadFolderInParallel(
        containerClient,
        outputFolder,
        outputFolder,
        runId, // Pass runId to create folder structure
      );

      console.log(
        `Successfully uploaded ${uploadedFiles.length} files to container: ${containerName} in folder: ${runId}`,
      );

      // Return the container URL with runId folder path (with index.html if it exists)
      const indexBlobClient = containerClient.getBlockBlobClient(`${runId}/index.html`);
      return indexBlobClient.url;
    } catch (error) {
      console.error("Error during HTML report folder upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`HTML report folder upload failed: ${errorMessage}`);
    }
  }

  /**
   * Uploads the entire Playwright HTML report folder after tests complete.
   * This method should be called from global teardown or after test execution.
   *
   * @param outputFolderName - The output folder name (optional, defaults to 'playwrightTestReport')
   * @returns Promise<string> - The URL of the uploaded report
   */
  async uploadPlaywrightHtmlReportAfterTests(outputFolderName?: string): Promise<string | null> {
    try {
      // Use provided credential or get from singleton
      const cred = PlaywrightServiceConfig.instance.credential;

      if (!cred) {
        console.log("No credential available for HTML report upload. Skipping upload.");
        return null;
      }

      console.log("Attempting to upload Playwright HTML report folder after test execution...");

      // Use provided output folder name or default
      const folderName = outputFolderName || "playwrightTestReport";
      const outputFolderPath = join(process.cwd(), folderName);
      console.log(`Using HTML report output folder: ${outputFolderPath}`);

      // Use runId from parameter, or get it from the singleton PlaywrightServiceConfig
      const testRunId = PlaywrightServiceConfig.instance.runId;
      console.log(`Using runId for container name: ${testRunId}`);

      // Check if output folder exists
      if (!existsSync(outputFolderPath)) {
        throw new Error(`HTML report output folder not found: ${outputFolderPath}`);
      }

      // Upload the entire report folder
      const reportUrl = await this.uploadHtmlReportFolder(cred, testRunId, outputFolderPath);

      console.log(`Complete Playwright HTML report folder uploaded to: ${reportUrl}`);
      return reportUrl;
    } catch (error) {
      console.warn(
        `Failed to upload final HTML report: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return null;
    }
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
    console.log(`Starting optimized parallel upload for folder: ${folderPath}`);

    // Collect and sort files (small files first for better perceived performance)
    const filesToUpload = this.collectAllFiles(folderPath, basePath, runIdFolderPrefix).sort(
      (a, b) => a.size - b.size,
    );

    console.log(
      `Found ${filesToUpload.length} files to upload (${this.formatFileSize(filesToUpload.reduce((sum, f) => sum + f.size, 0))} total)`,
    );

    if (filesToUpload.length === 0) {
      return [];
    }

    // Adaptive concurrency based on file count and sizes
    const concurrency = this.calculateOptimalConcurrency(filesToUpload);
    console.log(`Using concurrency: ${concurrency}`);

    // Use a semaphore-like approach for better control
    const results = await this.uploadWithConcurrencyControl(
      containerClient,
      filesToUpload,
      concurrency,
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      console.warn(`Upload completed: ${successful} successful, ${failed} failed`);
      // Log failed uploads for debugging
      results
        .filter((r) => r.status === "rejected")
        .slice(0, 5) // Show first 5 failures
        .forEach((r) => console.error(`Upload failed: ${(r as PromiseRejectedResult).reason}`));
    } else {
      console.log(`✓ All ${successful} files uploaded successfully`);
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
    const startTime = Date.now();

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
    return this.executeWithConcurrency(uploadTasks, concurrency, files.length, startTime);
  }

  /**
   * Executes tasks with controlled concurrency and reports progress per batch.
   */
  private async executeWithConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    concurrency: number,
    totalFiles?: number,
    startTime?: number,
  ): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = [];
    const batchCount = Math.ceil(tasks.length / concurrency);

    for (let i = 0; i < tasks.length; i += concurrency) {
      const currentBatch = Math.floor(i / concurrency) + 1;
      const batch = tasks.slice(i, i + concurrency);
      const batchSize = batch.length;

      console.log(
        `Batch ${currentBatch}/${batchCount}: Starting upload of ${batchSize} files (concurrency: ${batchSize})...`,
      );

      const batchStartTime = Date.now();
      const batchPromises = batch.map((task) => task());
      const batchResults = await Promise.allSettled(batchPromises);
      const batchDuration = (Date.now() - batchStartTime) / 1000;

      const batchSuccessful = batchResults.filter((r) => r.status === "fulfilled").length;
      const batchFailed = batchResults.filter((r) => r.status === "rejected").length;

      // Calculate overall progress
      const completedFiles = results.length + batchResults.length;
      const overallProgress = totalFiles ? ((completedFiles / totalFiles) * 100).toFixed(1) : "0.0";

      // Calculate rates and ETA
      let rateInfo = "";
      if (startTime && totalFiles) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = completedFiles / elapsed;
        const eta = totalFiles > completedFiles ? (totalFiles - completedFiles) / rate : 0;
        rateInfo = ` - ${rate.toFixed(1)} files/sec - ETA: ${eta.toFixed(0)}s`;
      }

      console.log(
        `Batch ${currentBatch} completed in ${batchDuration.toFixed(1)}s: ${batchSuccessful} successful${batchFailed > 0 ? `, ${batchFailed} failed` : ""} | Overall: ${completedFiles}/${totalFiles || tasks.length} (${overallProgress}%)${rateInfo}`,
      );

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
        console.warn(
          `Could not read directory ${currentPath}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
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
        console.warn(
          `Upload attempt ${attempt} failed for ${fileInfo.relativePath}, retrying in ${Math.round(delay)}ms: ${errorMessage}`,
        );
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
   * Formats file size in a human-readable format.
   *
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
