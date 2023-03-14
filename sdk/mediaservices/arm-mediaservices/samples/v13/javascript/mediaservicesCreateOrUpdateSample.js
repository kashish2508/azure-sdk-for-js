/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { AzureMediaServices } = require("@azure/arm-mediaservices");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

/**
 * This sample demonstrates how to Creates or updates a Media Services account
 *
 * @summary Creates or updates a Media Services account
 * x-ms-original-file: specification/mediaservices/resource-manager/Microsoft.Media/Accounts/stable/2023-01-01/examples/async-accounts-create.json
 */
async function createAMediaServicesAccount() {
  const subscriptionId =
    process.env["MEDIASERVICES_SUBSCRIPTION_ID"] || "00000000-0000-0000-0000-000000000000";
  const resourceGroupName = process.env["MEDIASERVICES_RESOURCE_GROUP"] || "contosorg";
  const accountName = "contososports";
  const parameters = {
    location: "South Central US",
    storageAccounts: [
      {
        type: "Primary",
        id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/contosorg/providers/Microsoft.Storage/storageAccounts/teststorageaccount",
      },
    ],
    tags: { key1: "value1", key2: "value2" },
  };
  const credential = new DefaultAzureCredential();
  const client = new AzureMediaServices(credential, subscriptionId);
  const result = await client.mediaservices.beginCreateOrUpdateAndWait(
    resourceGroupName,
    accountName,
    parameters
  );
  console.log(result);
}

/**
 * This sample demonstrates how to Creates or updates a Media Services account
 *
 * @summary Creates or updates a Media Services account
 * x-ms-original-file: specification/mediaservices/resource-manager/Microsoft.Media/Accounts/stable/2023-01-01/examples/async-accounts-create-managed-identity.json
 */
async function createAMediaServicesAccountManagedIdentity() {
  const subscriptionId =
    process.env["MEDIASERVICES_SUBSCRIPTION_ID"] || "00000000-0000-0000-0000-000000000000";
  const resourceGroupName = process.env["MEDIASERVICES_RESOURCE_GROUP"] || "contosorg";
  const accountName = "contososports";
  const parameters = {
    encryption: {
      type: "CustomerKey",
      identity: {
        useSystemAssignedIdentity: false,
        userAssignedIdentity:
          "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/contosorg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/id1",
      },
    },
    identity: {
      type: "UserAssigned",
      userAssignedIdentities: {
        "/subscriptions/00000000000000000000000000000000/resourceGroups/contosorg/providers/MicrosoftManagedIdentity/userAssignedIdentities/id1":
          {},
        "/subscriptions/00000000000000000000000000000000/resourceGroups/contosorg/providers/MicrosoftManagedIdentity/userAssignedIdentities/id2":
          {},
      },
    },
    keyDelivery: { accessControl: { defaultAction: "Allow" } },
    location: "South Central US",
    publicNetworkAccess: "Enabled",
    storageAccounts: [
      {
        type: "Primary",
        id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/contosorg/providers/Microsoft.Storage/storageAccounts/contososportsstore",
        identity: {
          useSystemAssignedIdentity: false,
          userAssignedIdentity:
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/contosorg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/id1",
        },
      },
    ],
    storageAuthentication: "ManagedIdentity",
    tags: { key1: "value1", key2: "value2" },
  };
  const credential = new DefaultAzureCredential();
  const client = new AzureMediaServices(credential, subscriptionId);
  const result = await client.mediaservices.beginCreateOrUpdateAndWait(
    resourceGroupName,
    accountName,
    parameters
  );
  console.log(result);
}

async function main() {
  createAMediaServicesAccount();
  createAMediaServicesAccountManagedIdentity();
}

main().catch(console.error);
