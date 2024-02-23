/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
  AmlFilesystem,
  StorageCacheManagementClient
} from "@azure/arm-storagecache";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * This sample demonstrates how to Create or update an AML file system.
 *
 * @summary Create or update an AML file system.
 * x-ms-original-file: specification/storagecache/resource-manager/Microsoft.StorageCache/preview/2023-11-01-preview/examples/amlFilesystems_CreateOrUpdate.json
 */
async function amlFilesystemsCreateOrUpdate() {
  const subscriptionId =
    process.env["STORAGECACHE_SUBSCRIPTION_ID"] ||
    "00000000-0000-0000-0000-000000000000";
  const resourceGroupName =
    process.env["STORAGECACHE_RESOURCE_GROUP"] || "scgroup";
  const amlFilesystemName = "fs1";
  const amlFilesystem: AmlFilesystem = {
    encryptionSettings: {
      keyEncryptionKey: {
        keyUrl:
          "https://examplekv.vault.azure.net/keys/kvk/3540a47df75541378d3518c6a4bdf5af",
        sourceVault: {
          id:
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/scgroup/providers/Microsoft.KeyVault/vaults/keyvault-cmk"
        }
      }
    },
    filesystemSubnet:
      "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/scgroup/providers/Microsoft.Network/virtualNetworks/scvnet/subnets/fsSub",
    hsm: {
      settings: {
        container:
          "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/scgroup/providers/Microsoft.Storage/storageAccounts/storageaccountname/blobServices/default/containers/containername",
        importPrefix: "/",
        loggingContainer:
          "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/scgroup/providers/Microsoft.Storage/storageAccounts/storageaccountname/blobServices/default/containers/loggingcontainername"
      }
    },
    identity: {
      type: "UserAssigned",
      userAssignedIdentities: {
        "/subscriptions/00000000000000000000000000000000/resourceGroups/scgroup/providers/MicrosoftManagedIdentity/userAssignedIdentities/identity1": {}
      }
    },
    location: "eastus",
    maintenanceWindow: { dayOfWeek: "Friday", timeOfDayUTC: "22:00" },
    rootSquashSettings: {
      mode: "All",
      noSquashNidLists: "10.0.0.[5-6]@tcp;10.0.1.2@tcp",
      squashGID: 99,
      squashUID: 99
    },
    sku: { name: "AMLFS-Durable-Premium-250" },
    storageCapacityTiB: 16,
    tags: { dept: "ContosoAds" },
    zones: ["1"]
  };
  const credential = new DefaultAzureCredential();
  const client = new StorageCacheManagementClient(credential, subscriptionId);
  const result = await client.amlFilesystems.beginCreateOrUpdateAndWait(
    resourceGroupName,
    amlFilesystemName,
    amlFilesystem
  );
  console.log(result);
}

async function main() {
  amlFilesystemsCreateOrUpdate();
}

main().catch(console.error);
