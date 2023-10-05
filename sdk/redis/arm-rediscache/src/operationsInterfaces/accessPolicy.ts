/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { SimplePollerLike, OperationState } from "@azure/core-lro";
import {
  RedisCacheAccessPolicy,
  AccessPolicyListOptionalParams,
  AccessPolicyCreateUpdateOptionalParams,
  AccessPolicyCreateUpdateResponse,
  AccessPolicyDeleteOptionalParams,
  AccessPolicyGetOptionalParams,
  AccessPolicyGetResponse
} from "../models";

/// <reference lib="esnext.asynciterable" />
/** Interface representing a AccessPolicy. */
export interface AccessPolicy {
  /**
   * Gets the list of access policies associated with this redis cache
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param cacheName The name of the Redis cache.
   * @param options The options parameters.
   */
  list(
    resourceGroupName: string,
    cacheName: string,
    options?: AccessPolicyListOptionalParams
  ): PagedAsyncIterableIterator<RedisCacheAccessPolicy>;
  /**
   * Adds an access policy to the redis cache
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param cacheName The name of the Redis cache.
   * @param accessPolicyName The name of the access policy that is being added to the Redis cache.
   * @param parameters Parameters supplied to the Create Update Access Policy operation.
   * @param options The options parameters.
   */
  beginCreateUpdate(
    resourceGroupName: string,
    cacheName: string,
    accessPolicyName: string,
    parameters: RedisCacheAccessPolicy,
    options?: AccessPolicyCreateUpdateOptionalParams
  ): Promise<
    SimplePollerLike<
      OperationState<AccessPolicyCreateUpdateResponse>,
      AccessPolicyCreateUpdateResponse
    >
  >;
  /**
   * Adds an access policy to the redis cache
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param cacheName The name of the Redis cache.
   * @param accessPolicyName The name of the access policy that is being added to the Redis cache.
   * @param parameters Parameters supplied to the Create Update Access Policy operation.
   * @param options The options parameters.
   */
  beginCreateUpdateAndWait(
    resourceGroupName: string,
    cacheName: string,
    accessPolicyName: string,
    parameters: RedisCacheAccessPolicy,
    options?: AccessPolicyCreateUpdateOptionalParams
  ): Promise<AccessPolicyCreateUpdateResponse>;
  /**
   * Deletes the access policy from a redis cache
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param cacheName The name of the Redis cache.
   * @param accessPolicyName The name of the access policy that is being added to the Redis cache.
   * @param options The options parameters.
   */
  beginDelete(
    resourceGroupName: string,
    cacheName: string,
    accessPolicyName: string,
    options?: AccessPolicyDeleteOptionalParams
  ): Promise<SimplePollerLike<OperationState<void>, void>>;
  /**
   * Deletes the access policy from a redis cache
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param cacheName The name of the Redis cache.
   * @param accessPolicyName The name of the access policy that is being added to the Redis cache.
   * @param options The options parameters.
   */
  beginDeleteAndWait(
    resourceGroupName: string,
    cacheName: string,
    accessPolicyName: string,
    options?: AccessPolicyDeleteOptionalParams
  ): Promise<void>;
  /**
   * Gets the detailed information about an access policy of a redis cache
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param cacheName The name of the Redis cache.
   * @param accessPolicyName The name of the access policy that is being added to the Redis cache.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    cacheName: string,
    accessPolicyName: string,
    options?: AccessPolicyGetOptionalParams
  ): Promise<AccessPolicyGetResponse>;
}
