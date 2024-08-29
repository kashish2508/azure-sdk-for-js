/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { ComputeManagementClient } = require("@azure/arm-compute");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

/**
 * This sample demonstrates how to Lists all available virtual machine sizes to which the specified virtual machine can be resized.
 *
 * @summary Lists all available virtual machine sizes to which the specified virtual machine can be resized.
 * x-ms-original-file: specification/compute/resource-manager/Microsoft.Compute/ComputeRP/stable/2024-07-01/examples/virtualMachineExamples/VirtualMachine_ListAvailableVmSizes.json
 */
async function listsAllAvailableVirtualMachineSizesToWhichTheSpecifiedVirtualMachineCanBeResized() {
  const subscriptionId = process.env["COMPUTE_SUBSCRIPTION_ID"] || "{subscription-id}";
  const resourceGroupName = process.env["COMPUTE_RESOURCE_GROUP"] || "myResourceGroup";
  const vmName = "myVmName";
  const credential = new DefaultAzureCredential();
  const client = new ComputeManagementClient(credential, subscriptionId);
  const resArray = new Array();
  for await (let item of client.virtualMachines.listAvailableSizes(resourceGroupName, vmName)) {
    resArray.push(item);
  }
  console.log(resArray);
}

async function main() {
  listsAllAvailableVirtualMachineSizesToWhichTheSpecifiedVirtualMachineCanBeResized();
}

main().catch(console.error);
