/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AzureMediaServices } from "@azure/arm-mediaservices";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * This sample demonstrates how to A live event is in StandBy state after allocation completes, and is ready to start.
 *
 * @summary A live event is in StandBy state after allocation completes, and is ready to start.
 * x-ms-original-file: specification/mediaservices/resource-manager/Microsoft.Media/Streaming/stable/2022-11-01/examples/liveevent-allocate.json
 */
async function allocateALiveEvent() {
  const subscriptionId =
    process.env["MEDIASERVICES_SUBSCRIPTION_ID"] ||
    "0a6ec948-5a62-437d-b9df-934dc7c1b722";
  const resourceGroupName =
    process.env["MEDIASERVICES_RESOURCE_GROUP"] || "mediaresources";
  const accountName = "slitestmedia10";
  const liveEventName = "myLiveEvent1";
  const credential = new DefaultAzureCredential();
  const client = new AzureMediaServices(credential, subscriptionId);
  const result = await client.liveEvents.beginAllocateAndWait(
    resourceGroupName,
    accountName,
    liveEventName
  );
  console.log(result);
}

async function main() {
  allocateALiveEvent();
}

main().catch(console.error);
