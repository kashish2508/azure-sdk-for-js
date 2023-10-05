/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { RedisManagementClient } = require("@azure/arm-rediscache");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

/**
 * This sample demonstrates how to Adds a linked server to the Redis cache (requires Premium SKU).
 *
 * @summary Adds a linked server to the Redis cache (requires Premium SKU).
 * x-ms-original-file: specification/redis/resource-manager/Microsoft.Cache/stable/2023-08-01/examples/RedisCacheLinkedServer_Create.json
 */
async function linkedServerCreate() {
  const subscriptionId = process.env["REDIS_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName = process.env["REDIS_RESOURCE_GROUP"] || "rg1";
  const name = "cache1";
  const linkedServerName = "cache2";
  const parameters = {
    linkedRedisCacheId:
      "/subscriptions/subid/resourceGroups/rg1/providers/Microsoft.Cache/Redis/cache2",
    linkedRedisCacheLocation: "West US",
    serverRole: "Secondary",
  };
  const credential = new DefaultAzureCredential();
  const client = new RedisManagementClient(credential, subscriptionId);
  const result = await client.linkedServer.beginCreateAndWait(
    resourceGroupName,
    name,
    linkedServerName,
    parameters
  );
  console.log(result);
}

async function main() {
  linkedServerCreate();
}

main().catch(console.error);
