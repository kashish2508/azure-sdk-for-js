/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import { setContinuationToken } from "../pagingHelper";
import { RegistryModelContainers } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { AzureMachineLearningServicesManagementClient } from "../azureMachineLearningServicesManagementClient";
import {
  SimplePollerLike,
  OperationState,
  createHttpPoller,
} from "@azure/core-lro";
import { createLroSpec } from "../lroImpl";
import {
  ModelContainer,
  RegistryModelContainersListNextOptionalParams,
  RegistryModelContainersListOptionalParams,
  RegistryModelContainersListResponse,
  RegistryModelContainersDeleteOptionalParams,
  RegistryModelContainersGetOptionalParams,
  RegistryModelContainersGetResponse,
  RegistryModelContainersCreateOrUpdateOptionalParams,
  RegistryModelContainersCreateOrUpdateResponse,
  RegistryModelContainersListNextResponse,
} from "../models";

/// <reference lib="esnext.asynciterable" />
/** Class containing RegistryModelContainers operations. */
export class RegistryModelContainersImpl implements RegistryModelContainers {
  private readonly client: AzureMachineLearningServicesManagementClient;

  /**
   * Initialize a new instance of the class RegistryModelContainers class.
   * @param client Reference to the service client
   */
  constructor(client: AzureMachineLearningServicesManagementClient) {
    this.client = client;
  }

  /**
   * List model containers.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param options The options parameters.
   */
  public list(
    resourceGroupName: string,
    registryName: string,
    options?: RegistryModelContainersListOptionalParams,
  ): PagedAsyncIterableIterator<ModelContainer> {
    const iter = this.listPagingAll(resourceGroupName, registryName, options);
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings?: PageSettings) => {
        if (settings?.maxPageSize) {
          throw new Error("maxPageSize is not supported by this operation.");
        }
        return this.listPagingPage(
          resourceGroupName,
          registryName,
          options,
          settings,
        );
      },
    };
  }

  private async *listPagingPage(
    resourceGroupName: string,
    registryName: string,
    options?: RegistryModelContainersListOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<ModelContainer[]> {
    let result: RegistryModelContainersListResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._list(resourceGroupName, registryName, options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listNext(
        resourceGroupName,
        registryName,
        continuationToken,
        options,
      );
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listPagingAll(
    resourceGroupName: string,
    registryName: string,
    options?: RegistryModelContainersListOptionalParams,
  ): AsyncIterableIterator<ModelContainer> {
    for await (const page of this.listPagingPage(
      resourceGroupName,
      registryName,
      options,
    )) {
      yield* page;
    }
  }

  /**
   * List model containers.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param options The options parameters.
   */
  private _list(
    resourceGroupName: string,
    registryName: string,
    options?: RegistryModelContainersListOptionalParams,
  ): Promise<RegistryModelContainersListResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, options },
      listOperationSpec,
    );
  }

  /**
   * Delete container.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param modelName Container name.
   * @param options The options parameters.
   */
  async beginDelete(
    resourceGroupName: string,
    registryName: string,
    modelName: string,
    options?: RegistryModelContainersDeleteOptionalParams,
  ): Promise<SimplePollerLike<OperationState<void>, void>> {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<void> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ) => {
      let currentRawResponse: coreClient.FullOperationResponse | undefined =
        undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown,
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback,
        },
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON(),
        },
      };
    };

    const lro = createLroSpec({
      sendOperationFn,
      args: { resourceGroupName, registryName, modelName, options },
      spec: deleteOperationSpec,
    });
    const poller = await createHttpPoller<void, OperationState<void>>(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "location",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Delete container.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param modelName Container name.
   * @param options The options parameters.
   */
  async beginDeleteAndWait(
    resourceGroupName: string,
    registryName: string,
    modelName: string,
    options?: RegistryModelContainersDeleteOptionalParams,
  ): Promise<void> {
    const poller = await this.beginDelete(
      resourceGroupName,
      registryName,
      modelName,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Get container.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param modelName Container name. This is case-sensitive.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    registryName: string,
    modelName: string,
    options?: RegistryModelContainersGetOptionalParams,
  ): Promise<RegistryModelContainersGetResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, modelName, options },
      getOperationSpec,
    );
  }

  /**
   * Create or update model container.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param modelName Container name.
   * @param body Container entity to create or update.
   * @param options The options parameters.
   */
  async beginCreateOrUpdate(
    resourceGroupName: string,
    registryName: string,
    modelName: string,
    body: ModelContainer,
    options?: RegistryModelContainersCreateOrUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<RegistryModelContainersCreateOrUpdateResponse>,
      RegistryModelContainersCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<RegistryModelContainersCreateOrUpdateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperationFn = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ) => {
      let currentRawResponse: coreClient.FullOperationResponse | undefined =
        undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown,
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback,
        },
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON(),
        },
      };
    };

    const lro = createLroSpec({
      sendOperationFn,
      args: { resourceGroupName, registryName, modelName, body, options },
      spec: createOrUpdateOperationSpec,
    });
    const poller = await createHttpPoller<
      RegistryModelContainersCreateOrUpdateResponse,
      OperationState<RegistryModelContainersCreateOrUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "original-uri",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Create or update model container.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param modelName Container name.
   * @param body Container entity to create or update.
   * @param options The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    registryName: string,
    modelName: string,
    body: ModelContainer,
    options?: RegistryModelContainersCreateOrUpdateOptionalParams,
  ): Promise<RegistryModelContainersCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(
      resourceGroupName,
      registryName,
      modelName,
      body,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * ListNext
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param registryName Name of Azure Machine Learning registry. This is case-insensitive
   * @param nextLink The nextLink from the previous successful call to the List method.
   * @param options The options parameters.
   */
  private _listNext(
    resourceGroupName: string,
    registryName: string,
    nextLink: string,
    options?: RegistryModelContainersListNextOptionalParams,
  ): Promise<RegistryModelContainersListNextResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, registryName, nextLink, options },
      listNextOperationSpec,
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const listOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/registries/{registryName}/models",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ModelContainerResourceArmPaginatedResult,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [
    Parameters.apiVersion,
    Parameters.skip,
    Parameters.listViewType,
  ],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.registryName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/registries/{registryName}/models/{modelName}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    201: {},
    202: {},
    204: {},
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.registryName,
    Parameters.modelName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const getOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/registries/{registryName}/models/{modelName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ModelContainer,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.registryName,
    Parameters.modelName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.MachineLearningServices/registries/{registryName}/models/{modelName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.ModelContainer,
    },
    201: {
      bodyMapper: Mappers.ModelContainer,
    },
    202: {
      bodyMapper: Mappers.ModelContainer,
    },
    204: {
      bodyMapper: Mappers.ModelContainer,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  requestBody: Parameters.body12,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.registryName,
    Parameters.modelName,
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};
const listNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.ModelContainerResourceArmPaginatedResult,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.nextLink,
    Parameters.registryName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
