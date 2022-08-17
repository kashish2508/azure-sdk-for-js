/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import {
  TestJobCreateParameters,
  TestJobCreateOptionalParams,
  TestJobCreateResponse,
  TestJobGetOptionalParams,
  TestJobGetResponse,
  TestJobResumeOptionalParams,
  TestJobStopOptionalParams,
  TestJobSuspendOptionalParams
} from "../models";

/** Interface representing a TestJobOperations. */
export interface TestJobOperations {
  /**
   * Create a test job of the runbook.
   * @param resourceGroupName Name of an Azure Resource group.
   * @param automationAccountName The name of the automation account.
   * @param runbookName The parameters supplied to the create test job operation.
   * @param parameters The parameters supplied to the create test job operation.
   * @param options The options parameters.
   */
  create(
    resourceGroupName: string,
    automationAccountName: string,
    runbookName: string,
    parameters: TestJobCreateParameters,
    options?: TestJobCreateOptionalParams
  ): Promise<TestJobCreateResponse>;
  /**
   * Retrieve the test job for the specified runbook.
   * @param resourceGroupName Name of an Azure Resource group.
   * @param automationAccountName The name of the automation account.
   * @param runbookName The runbook name.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    automationAccountName: string,
    runbookName: string,
    options?: TestJobGetOptionalParams
  ): Promise<TestJobGetResponse>;
  /**
   * Resume the test job.
   * @param resourceGroupName Name of an Azure Resource group.
   * @param automationAccountName The name of the automation account.
   * @param runbookName The runbook name.
   * @param options The options parameters.
   */
  resume(
    resourceGroupName: string,
    automationAccountName: string,
    runbookName: string,
    options?: TestJobResumeOptionalParams
  ): Promise<void>;
  /**
   * Stop the test job.
   * @param resourceGroupName Name of an Azure Resource group.
   * @param automationAccountName The name of the automation account.
   * @param runbookName The runbook name.
   * @param options The options parameters.
   */
  stop(
    resourceGroupName: string,
    automationAccountName: string,
    runbookName: string,
    options?: TestJobStopOptionalParams
  ): Promise<void>;
  /**
   * Suspend the test job.
   * @param resourceGroupName Name of an Azure Resource group.
   * @param automationAccountName The name of the automation account.
   * @param runbookName The runbook name.
   * @param options The options parameters.
   */
  suspend(
    resourceGroupName: string,
    automationAccountName: string,
    runbookName: string,
    options?: TestJobSuspendOptionalParams
  ): Promise<void>;
}
