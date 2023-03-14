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
import { ResourceManagementClient } from "../src/resourceManagementClient";

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

describe("Resources test", () => {
  let recorder: Recorder;
  let subscriptionId: string;
  let client: ResourceManagementClient;
  let location: string;
  let resourceGroup: string;
  let tagName: string;
  let scope: string;

  beforeEach(async function (this: Context) {
    recorder = new Recorder(this.currentTest);
    await recorder.start(recorderOptions);
    subscriptionId = env.SUBSCRIPTION_ID || '';
    // This is an example of how the environment variables are used
    const credential = createTestCredential();
    client = new ResourceManagementClient(credential, subscriptionId, recorder.configureClientOptions({}));
    location = "eastus";
    resourceGroup = "myjstest1";
    tagName = "tagyyy";
    scope = "subscriptions/" + subscriptionId + "/resourcegroups/" + resourceGroup;
  });

  afterEach(async function () {
    await recorder.stop();
  });

  it("resourceGroups create test", async function () {
    const res = await client.resourceGroups.createOrUpdate(resourceGroup, {
      location: location,
      tags: {
        tag1: "value1"
      }
    })
    assert.equal(res.name, resourceGroup)
  });

  it("resourceGroups get test", async function () {
    const res = await client.resourceGroups.get(resourceGroup);
    assert.equal(res.name, resourceGroup);
  });

  it("resourceGroups list test", async function () {
    const resArray = new Array();
    for await (let item of client.resourceGroups.list()) {
      resArray.push(item);
    }
    assert.notEqual(resArray.length, 0);
  });

  it("resourceGroups update test", async function () {
    const res = await client.resourceGroups.update(resourceGroup, {
      tags: {
        tag1: "value1",
        tag2: "value2"
      }
    })
    assert.equal(res.type, "Microsoft.Resources/resourceGroups");
  });

  it("tagsOperations create test", async function () {
    const res = await client.tagsOperations.createOrUpdate(tagName);
    assert.equal(res.tagName, tagName);
  });

  it("tagsOperations get test", async function () {
    const res = await client.tagsOperations.getAtScope(scope);
    assert.equal(res.name, "default");
  });

  it("tagsOperations list test", async function () {
    const resArray = new Array();
    for await (let item of client.tagsOperations.list()) {
      resArray.push(item);
    }
    assert.notEqual(resArray.length, 0);
  });

  it("tagsOperations update test", async function () {
    const res = await client.tagsOperations.updateAtScope(scope, {
      operation: "Delete",
      properties: {
        tags: {
          tagkey1: "tagvalue1"
        }
      }
    })
    assert.equal(res.type, "Microsoft.Resources/tags");
  });

  it("tagsOperations delete test", async function () {
    const res = await client.tagsOperations.deleteAtScope(scope);
    const resArray = new Array();
    for await (let item of client.tagsOperations.list()) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 24);
  });

  it("resourceGroups delete test", async function () {
    const res = await client.resourceGroups.beginDeleteAndWait(resourceGroup, testPollingOptions);
    const resArray = new Array();
    for await (let item of client.resourceGroups.list()) {
      resArray.push(item);
    }
    assert.notEqual(resArray.length, 0);
  });

  it("resources list test", async function () {
    const filter = `ResourceType eq 'Microsoft.OperationsManagement/solutions'`;
    const resources = [];
    const resourcesIterable = client.resources.list({ filter, top: 1 });
    // const resourcesIterable = resourceManager.resources.list();
    for await (const resource of resourcesIterable) {
      resources.push(resource);
    };
    assert(resources.length > 1);
  });


});
