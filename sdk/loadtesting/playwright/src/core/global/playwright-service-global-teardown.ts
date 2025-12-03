// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { dirname } from "node:path";
import type { FullConfig } from "@playwright/test";
import playwrightServiceEntra from "../playwrightServiceEntra.js";
import { loadCustomerGlobalFunction } from "../../common/executor.js";
import customerConfig from "../../common/customerConfig.js";
import { uploadPlaywrightReport } from "../reportUpload.js";

const playwrightServiceGlobalTeardownWrapper = async (config: FullConfig): Promise<void> => {
  const rootDir = config.configFile ? dirname(config.configFile!) : process.cwd();
  let customerGlobalTeardownFunc: any = null;
  if (customerConfig.globalTeardown && typeof customerConfig.globalTeardown === "string") {
    customerGlobalTeardownFunc = await loadCustomerGlobalFunction(
      rootDir,
      customerConfig.globalTeardown,
    );
  }
  playwrightServiceEntra.globalTeardown();
  
  // Upload Playwright HTML report to Azure Storage if credential is available
  // This happens automatically when using Entra ID authentication
  await uploadPlaywrightReport();
  
  if (customerGlobalTeardownFunc) {
    await customerGlobalTeardownFunc(config);
  }
};

export default playwrightServiceGlobalTeardownWrapper;
