/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import { setContinuationToken } from "../pagingHelper";
import { EmailServices } from "../operationsInterfaces";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers";
import * as Parameters from "../models/parameters";
import { CommunicationServiceManagementClient } from "../communicationServiceManagementClient";
import {
  SimplePollerLike,
  OperationState,
  createHttpPoller,
} from "@azure/core-lro";
import { createLroSpec } from "../lroImpl";
import {
  EmailServiceResource,
  EmailServicesListBySubscriptionNextOptionalParams,
  EmailServicesListBySubscriptionOptionalParams,
  EmailServicesListBySubscriptionResponse,
  EmailServicesListByResourceGroupNextOptionalParams,
  EmailServicesListByResourceGroupOptionalParams,
  EmailServicesListByResourceGroupResponse,
  EmailServicesGetOptionalParams,
  EmailServicesGetResponse,
  EmailServicesCreateOrUpdateOptionalParams,
  EmailServicesCreateOrUpdateResponse,
  EmailServicesDeleteOptionalParams,
  EmailServiceResourceUpdate,
  EmailServicesUpdateOptionalParams,
  EmailServicesUpdateResponse,
  EmailServicesListVerifiedExchangeOnlineDomainsOptionalParams,
  EmailServicesListVerifiedExchangeOnlineDomainsResponse,
  EmailServicesListBySubscriptionNextResponse,
  EmailServicesListByResourceGroupNextResponse,
} from "../models";

/// <reference lib="esnext.asynciterable" />
/** Class containing EmailServices operations. */
export class EmailServicesImpl implements EmailServices {
  private readonly client: CommunicationServiceManagementClient;

  /**
   * Initialize a new instance of the class EmailServices class.
   * @param client Reference to the service client
   */
  constructor(client: CommunicationServiceManagementClient) {
    this.client = client;
  }

  /**
   * Handles requests to list all resources in a subscription.
   * @param options The options parameters.
   */
  public listBySubscription(
    options?: EmailServicesListBySubscriptionOptionalParams,
  ): PagedAsyncIterableIterator<EmailServiceResource> {
    const iter = this.listBySubscriptionPagingAll(options);
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
        return this.listBySubscriptionPagingPage(options, settings);
      },
    };
  }

  private async *listBySubscriptionPagingPage(
    options?: EmailServicesListBySubscriptionOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<EmailServiceResource[]> {
    let result: EmailServicesListBySubscriptionResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listBySubscription(options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listBySubscriptionNext(continuationToken, options);
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listBySubscriptionPagingAll(
    options?: EmailServicesListBySubscriptionOptionalParams,
  ): AsyncIterableIterator<EmailServiceResource> {
    for await (const page of this.listBySubscriptionPagingPage(options)) {
      yield* page;
    }
  }

  /**
   * Handles requests to list all resources in a resource group.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param options The options parameters.
   */
  public listByResourceGroup(
    resourceGroupName: string,
    options?: EmailServicesListByResourceGroupOptionalParams,
  ): PagedAsyncIterableIterator<EmailServiceResource> {
    const iter = this.listByResourceGroupPagingAll(resourceGroupName, options);
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
        return this.listByResourceGroupPagingPage(
          resourceGroupName,
          options,
          settings,
        );
      },
    };
  }

  private async *listByResourceGroupPagingPage(
    resourceGroupName: string,
    options?: EmailServicesListByResourceGroupOptionalParams,
    settings?: PageSettings,
  ): AsyncIterableIterator<EmailServiceResource[]> {
    let result: EmailServicesListByResourceGroupResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listByResourceGroup(resourceGroupName, options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listByResourceGroupNext(
        resourceGroupName,
        continuationToken,
        options,
      );
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listByResourceGroupPagingAll(
    resourceGroupName: string,
    options?: EmailServicesListByResourceGroupOptionalParams,
  ): AsyncIterableIterator<EmailServiceResource> {
    for await (const page of this.listByResourceGroupPagingPage(
      resourceGroupName,
      options,
    )) {
      yield* page;
    }
  }

  /**
   * Get the EmailService and its properties.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param emailServiceName The name of the EmailService resource.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    emailServiceName: string,
    options?: EmailServicesGetOptionalParams,
  ): Promise<EmailServicesGetResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, emailServiceName, options },
      getOperationSpec,
    );
  }

  /**
   * Create a new EmailService or update an existing EmailService.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param emailServiceName The name of the EmailService resource.
   * @param parameters Parameters for the create or update operation
   * @param options The options parameters.
   */
  async beginCreateOrUpdate(
    resourceGroupName: string,
    emailServiceName: string,
    parameters: EmailServiceResource,
    options?: EmailServicesCreateOrUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<EmailServicesCreateOrUpdateResponse>,
      EmailServicesCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<EmailServicesCreateOrUpdateResponse> => {
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
      args: { resourceGroupName, emailServiceName, parameters, options },
      spec: createOrUpdateOperationSpec,
    });
    const poller = await createHttpPoller<
      EmailServicesCreateOrUpdateResponse,
      OperationState<EmailServicesCreateOrUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "azure-async-operation",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Create a new EmailService or update an existing EmailService.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param emailServiceName The name of the EmailService resource.
   * @param parameters Parameters for the create or update operation
   * @param options The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    emailServiceName: string,
    parameters: EmailServiceResource,
    options?: EmailServicesCreateOrUpdateOptionalParams,
  ): Promise<EmailServicesCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(
      resourceGroupName,
      emailServiceName,
      parameters,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Operation to delete a EmailService.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param emailServiceName The name of the EmailService resource.
   * @param options The options parameters.
   */
  async beginDelete(
    resourceGroupName: string,
    emailServiceName: string,
    options?: EmailServicesDeleteOptionalParams,
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
      args: { resourceGroupName, emailServiceName, options },
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
   * Operation to delete a EmailService.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param emailServiceName The name of the EmailService resource.
   * @param options The options parameters.
   */
  async beginDeleteAndWait(
    resourceGroupName: string,
    emailServiceName: string,
    options?: EmailServicesDeleteOptionalParams,
  ): Promise<void> {
    const poller = await this.beginDelete(
      resourceGroupName,
      emailServiceName,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Operation to update an existing EmailService.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param emailServiceName The name of the EmailService resource.
   * @param parameters Parameters for the update operation
   * @param options The options parameters.
   */
  async beginUpdate(
    resourceGroupName: string,
    emailServiceName: string,
    parameters: EmailServiceResourceUpdate,
    options?: EmailServicesUpdateOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<EmailServicesUpdateResponse>,
      EmailServicesUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec,
    ): Promise<EmailServicesUpdateResponse> => {
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
      args: { resourceGroupName, emailServiceName, parameters, options },
      spec: updateOperationSpec,
    });
    const poller = await createHttpPoller<
      EmailServicesUpdateResponse,
      OperationState<EmailServicesUpdateResponse>
    >(lro, {
      restoreFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      resourceLocationConfig: "azure-async-operation",
    });
    await poller.poll();
    return poller;
  }

  /**
   * Operation to update an existing EmailService.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param emailServiceName The name of the EmailService resource.
   * @param parameters Parameters for the update operation
   * @param options The options parameters.
   */
  async beginUpdateAndWait(
    resourceGroupName: string,
    emailServiceName: string,
    parameters: EmailServiceResourceUpdate,
    options?: EmailServicesUpdateOptionalParams,
  ): Promise<EmailServicesUpdateResponse> {
    const poller = await this.beginUpdate(
      resourceGroupName,
      emailServiceName,
      parameters,
      options,
    );
    return poller.pollUntilDone();
  }

  /**
   * Handles requests to list all resources in a subscription.
   * @param options The options parameters.
   */
  private _listBySubscription(
    options?: EmailServicesListBySubscriptionOptionalParams,
  ): Promise<EmailServicesListBySubscriptionResponse> {
    return this.client.sendOperationRequest(
      { options },
      listBySubscriptionOperationSpec,
    );
  }

  /**
   * Handles requests to list all resources in a resource group.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param options The options parameters.
   */
  private _listByResourceGroup(
    resourceGroupName: string,
    options?: EmailServicesListByResourceGroupOptionalParams,
  ): Promise<EmailServicesListByResourceGroupResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, options },
      listByResourceGroupOperationSpec,
    );
  }

  /**
   * Get a list of domains that are fully verified in Exchange Online.
   * @param options The options parameters.
   */
  listVerifiedExchangeOnlineDomains(
    options?: EmailServicesListVerifiedExchangeOnlineDomainsOptionalParams,
  ): Promise<EmailServicesListVerifiedExchangeOnlineDomainsResponse> {
    return this.client.sendOperationRequest(
      { options },
      listVerifiedExchangeOnlineDomainsOperationSpec,
    );
  }

  /**
   * ListBySubscriptionNext
   * @param nextLink The nextLink from the previous successful call to the ListBySubscription method.
   * @param options The options parameters.
   */
  private _listBySubscriptionNext(
    nextLink: string,
    options?: EmailServicesListBySubscriptionNextOptionalParams,
  ): Promise<EmailServicesListBySubscriptionNextResponse> {
    return this.client.sendOperationRequest(
      { nextLink, options },
      listBySubscriptionNextOperationSpec,
    );
  }

  /**
   * ListByResourceGroupNext
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param nextLink The nextLink from the previous successful call to the ListByResourceGroup method.
   * @param options The options parameters.
   */
  private _listByResourceGroupNext(
    resourceGroupName: string,
    nextLink: string,
    options?: EmailServicesListByResourceGroupNextOptionalParams,
  ): Promise<EmailServicesListByResourceGroupNextResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, nextLink, options },
      listByResourceGroupNextOperationSpec,
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const getOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Communication/emailServices/{emailServiceName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.EmailServiceResource,
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
    Parameters.emailServiceName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Communication/emailServices/{emailServiceName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    201: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    202: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    204: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  requestBody: Parameters.parameters6,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.emailServiceName,
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Communication/emailServices/{emailServiceName}",
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
    Parameters.emailServiceName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const updateOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Communication/emailServices/{emailServiceName}",
  httpMethod: "PATCH",
  responses: {
    200: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    201: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    202: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    204: {
      bodyMapper: Mappers.EmailServiceResource,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  requestBody: Parameters.parameters7,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.emailServiceName,
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer,
};
const listBySubscriptionOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/providers/Microsoft.Communication/emailServices",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.EmailServiceResourceList,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.subscriptionId],
  headerParameters: [Parameters.accept],
  serializer,
};
const listByResourceGroupOperationSpec: coreClient.OperationSpec = {
  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Communication/emailServices",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.EmailServiceResourceList,
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
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listVerifiedExchangeOnlineDomainsOperationSpec: coreClient.OperationSpec =
  {
    path: "/subscriptions/{subscriptionId}/providers/Microsoft.Communication/listVerifiedExchangeOnlineDomains",
    httpMethod: "POST",
    responses: {
      200: {
        bodyMapper: {
          type: { name: "Sequence", element: { type: { name: "String" } } },
        },
      },
      default: {
        bodyMapper: Mappers.ErrorResponse,
      },
    },
    queryParameters: [Parameters.apiVersion],
    urlParameters: [Parameters.$host, Parameters.subscriptionId],
    headerParameters: [Parameters.accept],
    serializer,
  };
const listBySubscriptionNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.EmailServiceResourceList,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  urlParameters: [
    Parameters.$host,
    Parameters.nextLink,
    Parameters.subscriptionId,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
const listByResourceGroupNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.EmailServiceResourceList,
    },
    default: {
      bodyMapper: Mappers.ErrorResponse,
    },
  },
  urlParameters: [
    Parameters.$host,
    Parameters.nextLink,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
  ],
  headerParameters: [Parameters.accept],
  serializer,
};
