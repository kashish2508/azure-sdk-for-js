// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { FullConfig, Reporter } from "@playwright/test/reporter";
import { PlaywrightReportUploader } from "../utils/playwrightReportUploader.js";
import { getHtmlReporterOutputFolder } from "../utils/utils.js";

/**
 * Azure Upload Reporter - Uploads generated HTML report folder to Azure Storage.
 */
export default class playwrightReporter implements Reporter {
  private config: FullConfig | undefined;

  /**
   * Called when test run begins. Stores configuration for later use.
   * @param config - Playwright test configuration
   */
  onBegin(config: FullConfig) {
    this.config = config;
  }

  /**
   * Called when test run ends. Uploads HTML report to Azure Storage.
   */
  async onEnd() {
    console.log(`Uploading Playwright Test report in Azure storage account.`);
    await this.uploadHtmlReport();
  }

  private async uploadHtmlReport(): Promise<void> {
    try {
      const outputFolder = getHtmlReporterOutputFolder(this.config);
      const uploader = new PlaywrightReportUploader();

      await uploader.uploadPlaywrightHtmlReportAfterTests(outputFolder);
      console.log(`✅ Playwright Test report uploaded successfully to Azure Storage.`);
    } catch (error) {
      console.error(
        `❌ Failed to upload HTML report: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
