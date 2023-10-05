/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import {
  env,
  Recorder,
  RecorderStartOptions,
  delay,
  isPlaybackMode,
} from "@azure-tools/test-recorder";
import { createTestCredential } from "@azure-tools/test-credential";
import { assert } from "chai";
import { Context } from "mocha";
import { EasmMgmtClient } from "../src/easmMgmtClient";

const replaceableVariables: Record<string, string> = {
  AZURE_CLIENT_ID: "azure_client_id",
  AZURE_CLIENT_SECRET: "azure_client_secret",
  AZURE_TENANT_ID: "88888888-8888-8888-8888-888888888888",
  SUBSCRIPTION_ID: "azure_subscription_id"
};

const recorderOptions: RecorderStartOptions = {
  envSetupForPlayback: replaceableVariables
};

export const testPollingOptions = {
  updateIntervalInMs: isPlaybackMode() ? 0 : undefined,
};

describe("DefenderEasm test", () => {
  let recorder: Recorder;
  let subscriptionId: string;
  let client: EasmMgmtClient;
  let location: string;
  let resourceGroup: string;
  let resourceName: string;

  beforeEach(async function (this: Context) {
    recorder = new Recorder(this.currentTest);
    await recorder.start(recorderOptions);
    subscriptionId = env.SUBSCRIPTION_ID || '';
    // This is an example of how the environment variables are used
    const credential = createTestCredential();
    client = new EasmMgmtClient(credential, subscriptionId, recorder.configureClientOptions({}));
    location = "eastus";
    resourceGroup = "myjstest";
    resourceName = "testresource1"
  });

  afterEach(async function () {
    await recorder.stop();
  });

  it("workspaces create test", async function () {
    const res = await client.workspaces.beginCreateAndUpdateAndWait(
      resourceGroup,
      resourceName,
      {
        workspaceResource: { location },
        updateIntervalInMs: isPlaybackMode() ? 0 : undefined,
      });
    assert.equal(res.name, resourceName);
  });

  it("workspaces get test", async function () {
    const res = await client.workspaces.get(resourceGroup,
      resourceName);
    assert.equal(res.name, resourceName);
  });

  it("workspaces list test", async function () {
    const resArray = new Array();
    for await (let item of client.workspaces.listByResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 1);
  });

  it("workspaces delete test", async function () {
    const resArray = new Array();
    const res = await client.workspaces.beginDeleteAndWait(resourceGroup, resourceName, testPollingOptions)
    for await (let item of client.workspaces.listByResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 0);
  });
})
