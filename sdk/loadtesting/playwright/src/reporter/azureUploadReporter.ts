// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { 
  FullConfig, 
  Reporter, 
  Suite, 
} from '@playwright/test/reporter';
import { PlaywrightServiceApiCall } from '../utils/playwrightServiceApicall.js';

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
 *   ['path/to/azureUploadReporter.js']                   // Upload to Azure
 * ]
 * ```
 */
export default class AzureUploadReporter implements Reporter {

  onBegin(_config: FullConfig, suite: Suite) {
    console.log(`🎭 Azure Upload Reporter: Starting for ${suite.allTests().length} tests`);
  }

  // onTestEnd(_test: TestCase, _result: TestResult) {
  //   // No action needed during individual test completion
  // }

  // async onEnd(_result: FullResult) {
  //   const duration = Date.now() - this.startTime;
  //   console.log(`🎭 Azure Upload Reporter: Tests completed in ${Math.round(duration / 1000)}s`);
    
  //   // Since our reporter is listed after the HTML reporter, onEnd() runs after HTML report generation
  //   await this.uploadHtmlReport();
  // }

  async onExit() {
    // onExit() runs after all reporters have completed, guaranteeing HTML report is ready
    console.log(`🎭 Azure Upload Reporter: Final cleanup, ensuring HTML report upload...`);
    await this.uploadHtmlReport();
  }

  private async uploadHtmlReport() {
    try {
      const apiClient = new PlaywrightServiceApiCall();
      const reportUrl = await apiClient.uploadPlaywrightHtmlReportAfterTests();
      
      if (reportUrl) {
        console.log(`✅ Azure Upload Reporter: HTML report uploaded successfully`);
        console.log(`📋 Report URL: ${reportUrl}`);
      } else {
        console.log(`⚠️  Azure Upload Reporter: Upload skipped (no credential or folder not found)`);
      }
    } catch (error) {
      console.error(`❌ Azure Upload Reporter: Failed to upload HTML report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
