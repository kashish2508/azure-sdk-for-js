/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

import * as msRest from "@azure/ms-rest-js";
import * as msRestAzure from "@azure/ms-rest-azure-js";
import * as Models from "../models";
import * as Mappers from "../models/restorePointCollectionsMappers";
import * as Parameters from "../models/parameters";
import { ComputeManagementClientContext } from "../computeManagementClientContext";

/** Class representing a RestorePointCollections. */
export class RestorePointCollections {
  private readonly client: ComputeManagementClientContext;

  /**
   * Create a RestorePointCollections.
   * @param {ComputeManagementClientContext} client Reference to the service client.
   */
  constructor(client: ComputeManagementClientContext) {
    this.client = client;
  }

  /**
   * The operation to create or update the restore point collection. Please refer to
   * https://aka.ms/RestorePoints for more details. When updating a restore point collection, only
   * tags may be modified.
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param parameters Parameters supplied to the Create or Update restore point collection
   * operation.
   * @param [options] The optional parameters
   * @returns Promise<Models.RestorePointCollectionsCreateOrUpdateResponse>
   */
  createOrUpdate(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollection, options?: msRest.RequestOptionsBase): Promise<Models.RestorePointCollectionsCreateOrUpdateResponse>;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param parameters Parameters supplied to the Create or Update restore point collection
   * operation.
   * @param callback The callback
   */
  createOrUpdate(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollection, callback: msRest.ServiceCallback<Models.RestorePointCollection>): void;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param parameters Parameters supplied to the Create or Update restore point collection
   * operation.
   * @param options The optional parameters
   * @param callback The callback
   */
  createOrUpdate(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollection, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.RestorePointCollection>): void;
  createOrUpdate(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollection, options?: msRest.RequestOptionsBase | msRest.ServiceCallback<Models.RestorePointCollection>, callback?: msRest.ServiceCallback<Models.RestorePointCollection>): Promise<Models.RestorePointCollectionsCreateOrUpdateResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        restorePointCollectionName,
        parameters,
        options
      },
      createOrUpdateOperationSpec,
      callback) as Promise<Models.RestorePointCollectionsCreateOrUpdateResponse>;
  }

  /**
   * The operation to update the restore point collection.
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param parameters Parameters supplied to the Update restore point collection operation.
   * @param [options] The optional parameters
   * @returns Promise<Models.RestorePointCollectionsUpdateResponse>
   */
  update(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollectionUpdate, options?: msRest.RequestOptionsBase): Promise<Models.RestorePointCollectionsUpdateResponse>;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param parameters Parameters supplied to the Update restore point collection operation.
   * @param callback The callback
   */
  update(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollectionUpdate, callback: msRest.ServiceCallback<Models.RestorePointCollection>): void;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param parameters Parameters supplied to the Update restore point collection operation.
   * @param options The optional parameters
   * @param callback The callback
   */
  update(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollectionUpdate, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.RestorePointCollection>): void;
  update(resourceGroupName: string, restorePointCollectionName: string, parameters: Models.RestorePointCollectionUpdate, options?: msRest.RequestOptionsBase | msRest.ServiceCallback<Models.RestorePointCollection>, callback?: msRest.ServiceCallback<Models.RestorePointCollection>): Promise<Models.RestorePointCollectionsUpdateResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        restorePointCollectionName,
        parameters,
        options
      },
      updateOperationSpec,
      callback) as Promise<Models.RestorePointCollectionsUpdateResponse>;
  }

  /**
   * The operation to delete the restore point collection. This operation will also delete all the
   * contained restore points.
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the Restore Point Collection.
   * @param [options] The optional parameters
   * @returns Promise<msRest.RestResponse>
   */
  deleteMethod(resourceGroupName: string, restorePointCollectionName: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse> {
    return this.beginDeleteMethod(resourceGroupName,restorePointCollectionName,options)
      .then(lroPoller => lroPoller.pollUntilFinished());
  }

  /**
   * The operation to get the restore point collection.
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param [options] The optional parameters
   * @returns Promise<Models.RestorePointCollectionsGetResponse>
   */
  get(resourceGroupName: string, restorePointCollectionName: string, options?: Models.RestorePointCollectionsGetOptionalParams): Promise<Models.RestorePointCollectionsGetResponse>;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param callback The callback
   */
  get(resourceGroupName: string, restorePointCollectionName: string, callback: msRest.ServiceCallback<Models.RestorePointCollection>): void;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the restore point collection.
   * @param options The optional parameters
   * @param callback The callback
   */
  get(resourceGroupName: string, restorePointCollectionName: string, options: Models.RestorePointCollectionsGetOptionalParams, callback: msRest.ServiceCallback<Models.RestorePointCollection>): void;
  get(resourceGroupName: string, restorePointCollectionName: string, options?: Models.RestorePointCollectionsGetOptionalParams | msRest.ServiceCallback<Models.RestorePointCollection>, callback?: msRest.ServiceCallback<Models.RestorePointCollection>): Promise<Models.RestorePointCollectionsGetResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        restorePointCollectionName,
        options
      },
      getOperationSpec,
      callback) as Promise<Models.RestorePointCollectionsGetResponse>;
  }

  /**
   * Gets the list of restore point collections in a resource group.
   * @param resourceGroupName The name of the resource group.
   * @param [options] The optional parameters
   * @returns Promise<Models.RestorePointCollectionsListResponse>
   */
  list(resourceGroupName: string, options?: msRest.RequestOptionsBase): Promise<Models.RestorePointCollectionsListResponse>;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param callback The callback
   */
  list(resourceGroupName: string, callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  /**
   * @param resourceGroupName The name of the resource group.
   * @param options The optional parameters
   * @param callback The callback
   */
  list(resourceGroupName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  list(resourceGroupName: string, options?: msRest.RequestOptionsBase | msRest.ServiceCallback<Models.RestorePointCollectionListResult>, callback?: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): Promise<Models.RestorePointCollectionsListResponse> {
    return this.client.sendOperationRequest(
      {
        resourceGroupName,
        options
      },
      listOperationSpec,
      callback) as Promise<Models.RestorePointCollectionsListResponse>;
  }

  /**
   * Gets the list of restore point collections in the subscription. Use nextLink property in the
   * response to get the next page of restore point collections. Do this till nextLink is not null to
   * fetch all the restore point collections.
   * @param [options] The optional parameters
   * @returns Promise<Models.RestorePointCollectionsListAllResponse>
   */
  listAll(options?: msRest.RequestOptionsBase): Promise<Models.RestorePointCollectionsListAllResponse>;
  /**
   * @param callback The callback
   */
  listAll(callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  /**
   * @param options The optional parameters
   * @param callback The callback
   */
  listAll(options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  listAll(options?: msRest.RequestOptionsBase | msRest.ServiceCallback<Models.RestorePointCollectionListResult>, callback?: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): Promise<Models.RestorePointCollectionsListAllResponse> {
    return this.client.sendOperationRequest(
      {
        options
      },
      listAllOperationSpec,
      callback) as Promise<Models.RestorePointCollectionsListAllResponse>;
  }

  /**
   * The operation to delete the restore point collection. This operation will also delete all the
   * contained restore points.
   * @param resourceGroupName The name of the resource group.
   * @param restorePointCollectionName The name of the Restore Point Collection.
   * @param [options] The optional parameters
   * @returns Promise<msRestAzure.LROPoller>
   */
  beginDeleteMethod(resourceGroupName: string, restorePointCollectionName: string, options?: msRest.RequestOptionsBase): Promise<msRestAzure.LROPoller> {
    return this.client.sendLRORequest(
      {
        resourceGroupName,
        restorePointCollectionName,
        options
      },
      beginDeleteMethodOperationSpec,
      options);
  }

  /**
   * Gets the list of restore point collections in a resource group.
   * @param nextPageLink The NextLink from the previous successful call to List operation.
   * @param [options] The optional parameters
   * @returns Promise<Models.RestorePointCollectionsListNextResponse>
   */
  listNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.RestorePointCollectionsListNextResponse>;
  /**
   * @param nextPageLink The NextLink from the previous successful call to List operation.
   * @param callback The callback
   */
  listNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  /**
   * @param nextPageLink The NextLink from the previous successful call to List operation.
   * @param options The optional parameters
   * @param callback The callback
   */
  listNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  listNext(nextPageLink: string, options?: msRest.RequestOptionsBase | msRest.ServiceCallback<Models.RestorePointCollectionListResult>, callback?: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): Promise<Models.RestorePointCollectionsListNextResponse> {
    return this.client.sendOperationRequest(
      {
        nextPageLink,
        options
      },
      listNextOperationSpec,
      callback) as Promise<Models.RestorePointCollectionsListNextResponse>;
  }

  /**
   * Gets the list of restore point collections in the subscription. Use nextLink property in the
   * response to get the next page of restore point collections. Do this till nextLink is not null to
   * fetch all the restore point collections.
   * @param nextPageLink The NextLink from the previous successful call to List operation.
   * @param [options] The optional parameters
   * @returns Promise<Models.RestorePointCollectionsListAllNextResponse>
   */
  listAllNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.RestorePointCollectionsListAllNextResponse>;
  /**
   * @param nextPageLink The NextLink from the previous successful call to List operation.
   * @param callback The callback
   */
  listAllNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  /**
   * @param nextPageLink The NextLink from the previous successful call to List operation.
   * @param options The optional parameters
   * @param callback The callback
   */
  listAllNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): void;
  listAllNext(nextPageLink: string, options?: msRest.RequestOptionsBase | msRest.ServiceCallback<Models.RestorePointCollectionListResult>, callback?: msRest.ServiceCallback<Models.RestorePointCollectionListResult>): Promise<Models.RestorePointCollectionsListAllNextResponse> {
    return this.client.sendOperationRequest(
      {
        nextPageLink,
        options
      },
      listAllNextOperationSpec,
      callback) as Promise<Models.RestorePointCollectionsListAllNextResponse>;
  }
}

// Operation Specifications
const serializer = new msRest.Serializer(Mappers);
const createOrUpdateOperationSpec: msRest.OperationSpec = {
  httpMethod: "PUT",
  path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/restorePointCollections/{restorePointCollectionName}",
  urlParameters: [
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.restorePointCollectionName
  ],
  queryParameters: [
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  requestBody: {
    parameterPath: "parameters",
    mapper: {
      ...Mappers.RestorePointCollection,
      required: true
    }
  },
  responses: {
    200: {
      bodyMapper: Mappers.RestorePointCollection
    },
    201: {
      bodyMapper: Mappers.RestorePointCollection
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};

const updateOperationSpec: msRest.OperationSpec = {
  httpMethod: "PATCH",
  path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/restorePointCollections/{restorePointCollectionName}",
  urlParameters: [
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.restorePointCollectionName
  ],
  queryParameters: [
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  requestBody: {
    parameterPath: "parameters",
    mapper: {
      ...Mappers.RestorePointCollectionUpdate,
      required: true
    }
  },
  responses: {
    200: {
      bodyMapper: Mappers.RestorePointCollection
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};

const getOperationSpec: msRest.OperationSpec = {
  httpMethod: "GET",
  path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/restorePointCollections/{restorePointCollectionName}",
  urlParameters: [
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.restorePointCollectionName
  ],
  queryParameters: [
    Parameters.expand0,
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  responses: {
    200: {
      bodyMapper: Mappers.RestorePointCollection
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};

const listOperationSpec: msRest.OperationSpec = {
  httpMethod: "GET",
  path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/restorePointCollections",
  urlParameters: [
    Parameters.subscriptionId,
    Parameters.resourceGroupName
  ],
  queryParameters: [
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  responses: {
    200: {
      bodyMapper: Mappers.RestorePointCollectionListResult
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};

const listAllOperationSpec: msRest.OperationSpec = {
  httpMethod: "GET",
  path: "subscriptions/{subscriptionId}/providers/Microsoft.Compute/restorePointCollections",
  urlParameters: [
    Parameters.subscriptionId
  ],
  queryParameters: [
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  responses: {
    200: {
      bodyMapper: Mappers.RestorePointCollectionListResult
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};

const beginDeleteMethodOperationSpec: msRest.OperationSpec = {
  httpMethod: "DELETE",
  path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/restorePointCollections/{restorePointCollectionName}",
  urlParameters: [
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.restorePointCollectionName
  ],
  queryParameters: [
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  responses: {
    200: {},
    202: {},
    204: {},
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};

const listNextOperationSpec: msRest.OperationSpec = {
  httpMethod: "GET",
  baseUrl: "https://management.azure.com",
  path: "{nextLink}",
  urlParameters: [
    Parameters.nextPageLink
  ],
  queryParameters: [
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  responses: {
    200: {
      bodyMapper: Mappers.RestorePointCollectionListResult
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};

const listAllNextOperationSpec: msRest.OperationSpec = {
  httpMethod: "GET",
  baseUrl: "https://management.azure.com",
  path: "{nextLink}",
  urlParameters: [
    Parameters.nextPageLink
  ],
  queryParameters: [
    Parameters.apiVersion0
  ],
  headerParameters: [
    Parameters.acceptLanguage
  ],
  responses: {
    200: {
      bodyMapper: Mappers.RestorePointCollectionListResult
    },
    default: {
      bodyMapper: Mappers.CloudError
    }
  },
  serializer
};
