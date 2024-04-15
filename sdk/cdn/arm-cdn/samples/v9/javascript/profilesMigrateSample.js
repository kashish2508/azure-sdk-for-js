/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { CdnManagementClient } = require("@azure/arm-cdn");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

/**
 * This sample demonstrates how to Migrate the CDN profile to Azure Frontdoor(Standard/Premium) profile. The change need to be committed after this.
 *
 * @summary Migrate the CDN profile to Azure Frontdoor(Standard/Premium) profile. The change need to be committed after this.
 * x-ms-original-file: specification/cdn/resource-manager/Microsoft.Cdn/stable/2024-02-01/examples/Profiles_Migrate.json
 */
async function profilesMigrate() {
  const subscriptionId = process.env["CDN_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName = process.env["CDN_RESOURCE_GROUP"] || "RG";
  const migrationParameters = {
    classicResourceReference: {
      id: "/subscriptions/subid/resourcegroups/RG/providers/Microsoft.Network/frontdoors/frontdoorname",
    },
    profileName: "profile1",
    sku: { name: "Standard_AzureFrontDoor" },
  };
  const credential = new DefaultAzureCredential();
  const client = new CdnManagementClient(credential, subscriptionId);
  const result = await client.profiles.beginMigrateAndWait(resourceGroupName, migrationParameters);
  console.log(result);
}

async function main() {
  profilesMigrate();
}

main().catch(console.error);
