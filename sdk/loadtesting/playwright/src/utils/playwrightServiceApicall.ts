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
import { readFileSync, existsSync } from "fs";
import { join } from "path";
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
      
      // Try to read Playwright HTML report, fallback to default content if not found
      let content = htmlContent;
      let blobName = fileName || `playwright-report-${+new Date()}.html`;
      
      if (!content) {
        content = await this.getPlaywrightHtmlReport();
      }
      
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

  /**
   * Reads the generated Playwright HTML report from the default output directory
   * 
   * @returns Promise<string> - The HTML content of the report
   * @throws Error when HTML report is not found
   */
  private async getPlaywrightHtmlReport(): Promise<string> {
    // Common Playwright HTML report locations
    const possiblePaths = [
      join(process.cwd(), "playwright-report", "index.html"),  // Default location
      // join(process.cwd(), "test-results", "report", "index.html"),
      // join(process.cwd(), "reports", "playwright", "index.html")
    ];

    // Try to find the HTML report
    for (const reportPath of possiblePaths) {
      if (existsSync(reportPath)) {
        try {
          console.log(`Found Playwright HTML report at: ${reportPath}`);
          const htmlContent = readFileSync(reportPath, "utf8");
          return htmlContent;
        } catch (error) {
          throw new Error(`Failed to read Playwright HTML report from ${reportPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // If no report found, throw error
    throw new Error(`Playwright HTML report not found. Please ensure HTML reporter is enabled in playwright.config.js and tests have completed successfully. Searched paths: ${possiblePaths.join(', ')}`);
  }



  /**
   * Uploads the Playwright HTML report after tests complete.
   * This method should be called from global teardown or after test execution.
   * 
   * @param credential - The DefaultAzureCredential (optional, will use singleton if not provided)
   * @returns Promise<string> - The URL of the uploaded blob
   */
  async uploadPlaywrightHtmlReportAfterTests(credential?: any): Promise<string | null> {
    try {
      // Use provided credential or get from singleton
      const cred = credential || PlaywrightServiceConfig.instance.credential;
      
      if (!cred) {
        console.log("No credential available for HTML report upload. Skipping upload.");
        return null;
      }

      console.log("Attempting to upload Playwright HTML report after test execution...");
      
      // Wait a bit to ensure HTML report is fully generated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to find and upload the actual HTML report
      const htmlContent = await this.getPlaywrightHtmlReport();
      const blobUrl = await this.uploadHtmlToStorage(cred, htmlContent, `playwright-report-final-${+new Date()}.html`);
      
      console.log(`Final Playwright HTML report uploaded to: ${blobUrl}`);
      return blobUrl;
    } catch (error) {
      console.warn(`Failed to upload final HTML report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }
}
