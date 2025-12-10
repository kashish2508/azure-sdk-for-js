import { createAzurePlaywrightConfig, ServiceAuth } from "@azure/playwright";
import { defineConfig } from "@playwright/test";
import { DefaultAzureCredential } from "@azure/identity";
import config from "./playwright.config.js";

const credential = new DefaultAzureCredential();

export default defineConfig(
  config,
  createAzurePlaywrightConfig(config, {
    credential,
    ServiceAuth: ServiceAuth.ENTRA_ID,
  }),
  {
    /* 
    Playwright Testing service reporter is added by default.
    This will override any reporter options specified in the base playwright config.
    If you are using more reporters, please update your configuration accordingly.
    */
    reporter: [
      ["html", { outputFolder: "kash-report", open: "always" }], // Generate HTML report
      ["@azure/playwright/reporter"], // Upload HTML report to Azure
    ],
  },
);
