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

  async patchTestRunAPIWithUpload(payload: TestRunCreatePayload, credential?: any): Promise<any> {
    const result = await this.patchTestRunAPI(payload);
    
    // If credential is provided, upload HTML file to storage
    if (credential) {
      try {
        const blobUrl = await this.uploadHtmlToStorage(credential);
        console.log(`HTML report uploaded to: ${blobUrl}`);
      } catch (error) {
        console.warn(`Failed to upload HTML report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Don't fail the test run creation if HTML upload fails
      }
    }
    
    return result;
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
   * Creates an HTML file and uploads it to the specified Azure Storage Account.
   * 
   * @param credential - The DefaultAzureCredential from options.credential
   * @param htmlContent - The HTML content to be uploaded (optional, defaults to basic HTML)
   * @param fileName - The name of the HTML file (optional, defaults to timestamp-based name)
   * @returns Promise<string> - The URL of the uploaded blob
   */
  async uploadHtmlToStorage(
    credential: any,
    htmlContent?: string,
    fileName?: string
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
      const containerName = `playwright-reports-${+new Date()}`;
      const containerClient = blobServiceClient.getContainerClient(containerName);
      
      // Create the container if it doesn't exist (private access by default)
      await containerClient.createIfNotExists();
      
      console.log("containerClient1 :",containerClient)
      // Default HTML content if not provided
      const defaultHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Test Report</title>
</head>
<body>
    <h1>Playwright Test Report</h1>
    <p>Generated on: ${new Date().toISOString()}</p>
    <p>Test run created successfully!</p>
</body>
</html>`;
      
      const content = htmlContent || defaultHtmlContent;
      const blobName = fileName || `newblob ${+new Date()}`;
      
      // Get block blob client and upload
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      console.log("blockBlobClient2: ",blockBlobClient)
      const uploadBlobResponse = await blockBlobClient.upload(content, content.length, {
        blobHTTPHeaders: {
          blobContentType: "text/html"
        }
      });
      console.log("DEBUG: Uploaded blob response:", uploadBlobResponse);
      console.log(
        `Upload block blob ${blobName} successfully with request ID: ${uploadBlobResponse.requestId}`
      );
      
      return blockBlobClient.url;
    } catch (error) {
      console.error("DEBUG: Error during HTML upload to storage:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Failed to upload HTML file to storage: ${errorMessage}`);
      throw new Error(`HTML file upload failed: ${errorMessage}`);
    }
  }
}
