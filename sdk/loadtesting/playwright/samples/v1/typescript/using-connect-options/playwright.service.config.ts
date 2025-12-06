import { createAzurePlaywrightConfig, AzureUploadReporter } from "@azure/playwright";
import { defineConfig } from "@playwright/test";
import { DefaultAzureCredential } from "@azure/identity";
import config from "./playwright.config.js";
import { ServiceAuth } from "../../../../src/index.js";

const credential = new DefaultAzureCredential();

export default defineConfig(
  config,
  createAzurePlaywrightConfig(config, {
    credential,
    ServiceAuth: ServiceAuth.ACCESS_TOKEN
  }),
 {
    /* 
    Playwright Testing service reporter is added by default.
    This will override any reporter options specified in the base playwright config.
    If you are using more reporters, please update your configuration accordingly.
    */
    reporter: [
      ['html', { outputFolder: 'playwrightTestReport' }],  // Generate HTML report
      ['../../../../dist/esm/reporter/azureUploadReporter.js'] // Upload HTML report to Azure
    ],
  }
);
