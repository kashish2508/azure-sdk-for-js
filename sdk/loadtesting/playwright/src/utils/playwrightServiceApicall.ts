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
import { join,relative } from "path";
import { PlaywrightServiceConfig } from '../common/playwrightServiceConfig.js';

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
   * Uploads the entire HTML report folder to the specified Azure Storage Account.
   * 
   * @param credential - The DefaultAzureCredential from options.credential
   * @param runId - The test run ID to use as container name
   * @param outputFolder - The path to the output folder to upload
   * @returns Promise<string> - The URL of the uploaded container
   */
  async uploadHtmlReportFolder(
    credential: any,
    runId: string,
    outputFolder: string
  ): Promise<string> {
    try {
      // Storage account details
      const account = "2009str2009";
      const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        credential
      );
      console.log("DEBUG: Initialized BlobServiceClient for account:", account);
      console.log("blobServiceClient: ",blobServiceClient);
      
      // Use runId as container name (sanitized for Azure naming requirements)
      const containerName = runId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const containerClient = blobServiceClient.getContainerClient(containerName);
      
      // Create the container if it doesn't exist (private access by default)
      await containerClient.createIfNotExists();
      
      console.log("containerClient:", containerClient);
      
      // Check if output folder exists
      if (!existsSync(outputFolder)) {
        throw new Error(`Output folder not found: ${outputFolder}`);
      }
      
      // Upload all files from the output folder recursively
      const uploadedFiles = await this.uploadFolderRecursively(containerClient, outputFolder, outputFolder);
      
      console.log(`Successfully uploaded ${uploadedFiles.length} files to container: ${containerName}`);
      
      // Return the container URL (with index.html if it exists)
      const indexBlobClient = containerClient.getBlockBlobClient('index.html');
      return indexBlobClient.url;
    } catch (error) {
      console.error("DEBUG: Error during HTML report folder upload to storage:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Failed to upload HTML report folder to storage: ${errorMessage}`);
      throw new Error(`HTML report folder upload failed: ${errorMessage}`);
    }
  }




  /**
   * Uploads the entire Playwright HTML report folder after tests complete.
   * This method should be called from global teardown or after test execution.
   * 
   * @param runId - The test run ID to use as container name (optional, defaults to timestamp)
   * @returns Promise<string> - The URL of the uploaded report
   */
  async uploadPlaywrightHtmlReportAfterTests(): Promise<string | null> {
    try {
      // Use provided credential or get from singleton
      const cred = PlaywrightServiceConfig.instance.credential;
      
      if (!cred) {
        console.log("No credential available for HTML report upload. Skipping upload.");
        return null;
      }

      console.log("Attempting to upload Playwright HTML report folder after test execution...");
      
      // Use the fixed output folder name
      const outputFolderName = 'playwrightTestReport';
      const outputFolderPath = join(process.cwd(), outputFolderName);
      console.log(`Using HTML report output folder: ${outputFolderPath}`);
      
      // Use runId from parameter, or get it from the singleton PlaywrightServiceConfig
      const testRunId = PlaywrightServiceConfig.instance.runId;
      console.log(`Using runId for container name: ${testRunId}`);
      
      // Wait a bit to ensure HTML report is fully generated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if output folder exists
      if (!existsSync(outputFolderPath)) {
        throw new Error(`HTML report output folder not found: ${outputFolderPath}`);
      }
      
      // Upload the entire report folder
      const reportUrl = await this.uploadHtmlReportFolder(cred, testRunId, outputFolderPath);
      
      console.log(`Complete Playwright HTML report folder uploaded to: ${reportUrl}`);
      return reportUrl;
    } catch (error) {
      console.warn(`Failed to upload final HTML report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Recursively uploads all files from a folder to Azure Blob Storage
   * 
   * @param containerClient - The Azure container client
   * @param folderPath - The local folder path to upload
   * @param basePath - The base path for calculating relative blob names
   * @returns Promise<string[]> - Array of uploaded blob names
   */
  private async uploadFolderRecursively(
    containerClient: any,
    folderPath: string,
    basePath: string
  ): Promise<string[]> {
    const uploadedFiles: string[] = [];
    
    try {
      console.log(`Processing folder: ${folderPath}`);
      const items = readdirSync(folderPath);
      console.log(`Found ${items.length} items in ${folderPath}:`, items);
      
      for (const item of items) {
        const itemPath = join(folderPath, item);
        const stats = statSync(itemPath);
        
        if (stats.isDirectory()) {
          // Recursively upload subdirectory
          console.log(`Entering subdirectory: ${itemPath}`);
          const subFiles = await this.uploadFolderRecursively(containerClient, itemPath, basePath);
          console.log(`Uploaded ${subFiles.length} files from subdirectory: ${itemPath}`);
          uploadedFiles.push(...subFiles);
        } else {
          // Upload file
          const relativePath = relative(basePath, itemPath).replace(/\\\\/g, '/');
          const fileContent = readFileSync(itemPath);
          
          // Determine content type based on file extension
          const contentType = this.getContentType(itemPath);
          
          const blockBlobClient = containerClient.getBlockBlobClient(relativePath);
          await blockBlobClient.upload(fileContent, fileContent.length, {
            blobHTTPHeaders: {
              blobContentType: contentType
            }
          });
          
          console.log(`✓ Uploaded file: ${relativePath} (${contentType}, ${fileContent.length} bytes)`);
          uploadedFiles.push(relativePath);
        }
      }
    } catch (error) {
      console.error(`Error uploading folder ${folderPath}:`, error);
      throw error;
    }
    
    console.log(`Completed folder ${folderPath}: uploaded ${uploadedFiles.length} files`);
    return uploadedFiles;
  }

  /**
   * Determines the content type based on file extension
   * 
   * @param filePath - The file path
   * @returns string - The MIME type
   */
  private getContentType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    
    const contentTypes: { [key: string]: string } = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'txt': 'text/plain',
      'ttf': 'font/ttf',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'webmanifest': 'application/manifest+json',
      'map': 'application/json'
    };
    
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}
