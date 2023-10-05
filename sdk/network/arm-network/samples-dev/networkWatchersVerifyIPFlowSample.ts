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
  VerificationIPFlowParameters,
  NetworkManagementClient
} from "@azure/arm-network";
import { DefaultAzureCredential } from "@azure/identity";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * This sample demonstrates how to Verify IP flow from the specified VM to a location given the currently configured NSG rules.
 *
 * @summary Verify IP flow from the specified VM to a location given the currently configured NSG rules.
 * x-ms-original-file: specification/network/resource-manager/Microsoft.Network/stable/2023-05-01/examples/NetworkWatcherIpFlowVerify.json
 */
async function ipFlowVerify() {
  const subscriptionId = process.env["NETWORK_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName = process.env["NETWORK_RESOURCE_GROUP"] || "rg1";
  const networkWatcherName = "nw1";
  const parameters: VerificationIPFlowParameters = {
    direction: "Outbound",
    localIPAddress: "10.2.0.4",
    localPort: "80",
    remoteIPAddress: "121.10.1.1",
    remotePort: "80",
    targetResourceId:
      "/subscriptions/subid/resourceGroups/rg2/providers/Microsoft.Compute/virtualMachines/vm1",
    protocol: "TCP"
  };
  const credential = new DefaultAzureCredential();
  const client = new NetworkManagementClient(credential, subscriptionId);
  const result = await client.networkWatchers.beginVerifyIPFlowAndWait(
    resourceGroupName,
    networkWatcherName,
    parameters
  );
  console.log(result);
}

async function main() {
  ipFlowVerify();
}

main().catch(console.error);
