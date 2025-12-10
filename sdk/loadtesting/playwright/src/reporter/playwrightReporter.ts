// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { FullConfig, Reporter, Suite } from "@playwright/test/reporter";
import { PlaywrightServiceApiCall } from "../utils/playwrightServiceApicall.js";

/**
 * Azure Upload Reporter - Uploads generated HTML report folder to Azure Storage.
 *
 * This reporter should be used alongside the HTML reporter and will run after
 * the HTML reporter completes generating the report. It only handles uploading
 * the files to Azure Storage.
 *
 * Usage in playwright.config.ts:
 * ```
 * reporter: [
 *   ['html', { outputFolder: 'playwrightTestReport' }],  // Generate HTML report
 *   ['path/to/playwrightReporter.js']                   // Upload to Azure
 * ]
 * ```
 */
export default class playwrightReporter implements Reporter {
  private config: FullConfig | undefined;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    console.log(`🎭 Azure Upload Reporter: Starting for ${suite.allTests().length} tests`);
  }

  // onTestEnd(_test: TestCase, _result: TestResult) {
  //   // No action needed during individual test completion
  // }

  async onEnd() {
    // const duration = Date.now() - this.startTime;
    console.log(`🎭 Azure Upload Reporter: Final cleanup, ensuring HTML report upload...`);

    // Since our reporter is listed after the HTML reporter, onEnd() runs after HTML report generation
    await this.uploadHtmlReport();
  }

  // async onExit() {
  //   // onExit() runs after all reporters have completed, guaranteeing HTML report is ready
  //   console.log(`🎭 Azure Upload Reporter: Final cleanup, ensuring HTML report upload...`);
  //   await this.uploadHtmlReport();
  // }

  private async uploadHtmlReport() {
    try {
      // Extract HTML reporter output folder from configuration
      const htmlOutputFolder = this.getHtmlReporterOutputFolder();

      const apiClient = new PlaywrightServiceApiCall();
      const reportUrl = await apiClient.uploadPlaywrightHtmlReportAfterTests(htmlOutputFolder);

      if (reportUrl) {
        console.log(`✅ Azure Upload Reporter: HTML report uploaded successfully`);
        console.log(`📋 Report URL: ${reportUrl}`);
      } else {
        console.log(
          `⚠️  Azure Upload Reporter: Upload skipped (no credential or folder not found)`,
        );
      }
    } catch (error) {
      console.error(
        `❌ Azure Upload Reporter: Failed to upload HTML report: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Extracts the output folder from HTML reporter configuration.
   * Returns 'playwrightTestReport' as default if not configured.
   */
  private getHtmlReporterOutputFolder(): string {
    const defaultFolder = "playwright-report";

    if (!this.config?.reporter) {
      return defaultFolder;
    }

    // Find HTML reporter in the configuration
    for (const reporter of this.config.reporter) {
      if (Array.isArray(reporter)) {
        const [reporterName, options] = reporter;
        if (reporterName === "html" && options && typeof options === "object") {
          // Return the configured outputFolder or default
          return (options as any).outputFolder || defaultFolder;
        }
      } else if (typeof reporter === "string" && reporter === "html") {
        // HTML reporter without options, use default
        return defaultFolder;
      }
    }

    return defaultFolder;
  }
}
