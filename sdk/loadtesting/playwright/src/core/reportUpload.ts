// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PlaywrightServiceApiCall } from "../utils/playwrightServiceApicall.js";

/**
 * Internal function to upload the Playwright HTML report to Azure Storage after tests complete.
 * This function is called automatically by the package's global teardown when Entra ID authentication is used.
 * 
 * @internal
 * @param runId - Optional run ID to use as container name, defaults to timestamp-based ID
 * @returns Promise<string | null> - The URL of the uploaded HTML report, or null if upload was skipped
 */
export async function uploadPlaywrightReport(): Promise<string | null> {
  try {
    const apiClient = new PlaywrightServiceApiCall();
    // Use provided runId or get it from the singleton (no need to pass undefined)
    const blobUrl = await apiClient.uploadPlaywrightHtmlReportAfterTests();
    
    if (blobUrl) {
      console.log("✅ Playwright HTML report successfully uploaded to Azure Storage");
      return blobUrl;
    } else {
      console.log("ℹ️  HTML report upload skipped (no credential available or upload disabled)");
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to upload Playwright HTML report:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}
