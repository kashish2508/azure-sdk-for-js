// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { FullConfig, Reporter, Suite } from "@playwright/test/reporter";
import { PlaywrightServiceApiCall } from "../utils/playwrightServiceApicall.js";
import { getHtmlReporterOutputFolder } from "../utils/utils.js";

/**
 * Azure Upload Reporter - Uploads generated HTML report folder to Azure Storage.
 */
export default class playwrightReporter implements Reporter {
  private config: FullConfig | undefined;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
  }

  async onEnd() {
    console.log(`Uploading Playwright Test report...`);
    await this.uploadHtmlReport();
  }

  private async uploadHtmlReport(): Promise<void> {
    try {
      const outputFolder = getHtmlReporterOutputFolder(this.config);
      const playwrightServiceApiClient = new PlaywrightServiceApiCall();

      await playwrightServiceApiClient.uploadPlaywrightHtmlReportAfterTests(outputFolder);
      console.log(`✅ HTML report uploaded successfully to Azure Storage`);
    } catch (error) {
      console.error(
        `❌ Failed to upload HTML report: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
