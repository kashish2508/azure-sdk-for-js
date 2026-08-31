# Guide for migrating to code generation from TypeSpec (Azure JavaScript SDK)

> **Terminology used in this guide**
>
> - **Libraries generated from TypeSpec**: Client libraries produced by the **TypeSpec Emitter** (the new generation toolchain).  
>   Previously referred to as *“modular”/“modularized libraries.”*
> - **Libraries generated with AutoRest**: Client libraries produced by the **AutoRest Code Generator** (previous generation).  
>   Previously referred to as *“HLC”, "Swagger generator", "OpenAPI Generator"*

This guide helps developers transition their JavaScript/TypeScript applications to use the *TypeSpec generated* Azure SDK libraries.

**For new customers of the JavaScript/TypeScript SDK ([azure-sdk-for-js](https://github.com/Azure/azure-sdk-for-js)), please see [quick start guide](https://github.com/Azure/azure-sdk-for-js/blob/main/documentation/quickstart-guide-for-libraries-generated-from-TypeSpec.md).**

## Current status

Several packages generated from *TypeSpec* have already reached General Availability (GA), including `@azure/arm-avs`, `@azure/arm-fabric`, `@azure/arm-oracledatabase`, `@azure/keyvault-admin`. We are actively working on releasing more packages and eventually cover all Azure services. Please find the latest version of those libraries in [npm](https://www.npmjs.com) and give them a try.

## Library improvements when generating from *TypeSpec*

We recommend reviewing the [complete guide](https://devblogs.microsoft.com/azure-sdk/azure-sdk-libraries-generated-from-typespec-for-javascript/) for full details. Compared to libraries generated with *Autorest*, *TypeSpec code generation* has following key benefits:

1. Subpath exports: Libraries now leverage [subpath exports](https://nodejs.org/api/packages.html#subpath-exports)(introduced in Node.js version 12.7) to provide layered APIs. This means developer can access the familiar `Client` at the root level while also using the `/api` subpath for fine-grained, operation-level imports.
1. Bundle size optimization: By leveraging the new `/api` subpath export, developers can selectively import only the operations they need. This approach minimizes the overall library footprint in the application bundle, ensuring that only the required pieces are included.
1. Long-running operations: some libraries generated from TypeSpec expose a newer single-method LRO shape (`doSth()` returning a Promise-like poller), while others retain compatibility `begin*` helpers. Check the specific package API before migrating code.


## How to migrate to libraries generated from TypeSpec

If you’re updating an existing application from **libraries generated with AutoRest** to **libraries generated from TypeSpec**, focus on these key areas:

1. **Long-running operations (LROs)** – Updated method signatures and poller behavior
2. **List operations (paging)** – Simplified continuation token handling

### Long-running Operations (LROs)

Based on customer feedback, we simplified LROs to make the API **cleaner and more ergonomic**. Three changes matter for migration:

- **Method shape**: two methods → one method  
- **Poller type**: `SimplePollerLike` → `PollerLike` (Promise‑like)  
- **Rehydration**: option‑based → helper function
#### Method signature changes
Previously (libraries generated with **AutoRest**), each LRO exposed two methods (e.g., `beginStart` and `beginStartAndWait`).  
Now (libraries generated from **TypeSpec**), there’s a **single** method that behaves as a poller **and** can be directly awaited.

**AutoRest‑generated (previous)**  
```ts
beginStart(
    options?: IntegrationRuntimesStartOptionalParams,
  ): Promise<
    SimplePollerLike<
      OperationState<IntegrationRuntimesStartResponse>,
      IntegrationRuntimesStartResponse
    >
  >;
beginStartAndWait(
    options?: IntegrationRuntimesStartOptionalParams,
  ): Promise<IntegrationRuntimesStartResponse>;
```
**TypeSpec‑generated (current)**

```ts
start(options?: IntegrationRuntimesStartOptionalParams): PollerLike<
      OperationState<IntegrationRuntimesStartResponse>,
      IntegrationRuntimesStartResponse
    >;
```
**Migrate your usage**
```ts
// Before (AutoRest-generated)
const result = await beginStartAndWait();

const poller = await beginStart();
const result2 = await poller.pollUntilDone();

// After (TypeSpec-generated)
const result = await start();           // awaiting returns the final result

const poller = start();                 // direct access to the poller
const result2 = await poller;           // or: await poller.pollUntilDone()
```

#### Poller type: `SimplePollerLike` → `PollerLike`

TypeSpec‑generated LROs return a `PollerLike`, which is also **Promise‑like**.

| Capability                                  | AutoRest (`SimplePollerLike`) | TypeSpec (`PollerLike`) |
|---------------------------------------------|-------------------------------|-------------------------|
| Return final results                        | `pollUntilDone()`             | `pollUntilDone()`       |
| Poll                                        | `poll()`                      | `poll()`                |
| Observe progress                            | `onProgress()`                | `onProgress()`          |
| Check completion                            | `getOperationState().isCompleted`/`isDone()` | `isDone()`             |
| Stop / check stopped                        | `stopPolling()` / `isStopped()` | `stopPolling()` / `isStopped()` |
| Read current state                          | `getOperationState()`         | `getOperationState()`   |
| Access final result                         | `getResult()`                 | `getResult()`           |
| Serialize poller state                      | `toString()`                  | `toString()`            |
| Await initial submission                    | N/A                           | N/A                     |

#### Rehydration (restoring a poller)

Rehydration behavior is package-specific. Some TypeSpec-generated packages expose helper functions such as `restorePoller(...)`, while others continue to support `resumeFrom` on operation options. Check the generated package source and README for the exact pattern your package uses.

For more detail on current poller primitives, see the core-lro docs in `sdk/core/core-lro/`.

---

#### Quick migration checklist

- Replace `beginXxxAndWait()` → `await xxx()`.  
- Replace `await beginXxx()` → `const poller = xxx()`.  
- Replace `poller.pollUntilDone()` usage as needed, but keep using `toString()`, `getOperationState()`, `getResult()`, `stopPolling()`, and `isStopped()` when the returned poller type exposes them.
- If you previously used `resumeFrom`, check whether your generated package still supports it or provides a restore helper.
- Verify the exact LRO surface in the generated package before making broad migration changes.

---
### List operations (paging)
Paging has been simplified in libraries generated from TypeSpec. Two main changes:

- **Removed unsupported `maxpagesize`**  
- **Replaced `getContinuationToken` helper with direct `continuationToken` property**


#### `maxpagesize` removed
The `maxpagesize` setting was never supported in AutoRest-generated clients, so it has been removed from `PageSettings`. No behavioral impact is expected.

#### Continuation token access simplified
Previously, you needed a helper function to extract the continuation token:

**AutoRest-generated (previous)**  
```ts
const firstPage = await iter.byPage().next();
const continuationToken = getContinuationToken(firstPage);
```

Now, the token is exposed directly on the page object:

**TypeSpec-generated (current)**  
```ts
export type ContinuablePage<TElement, TPage = TElement[]> = TPage & {
  /** Token to continue iteration */
  continuationToken?: string;
};

const firstPage = await iter.byPage().next();
const continuationToken = firstPage.value.continuationToken;
```

## Need help

If you have encountered an issue during migration, please file an issue via [GitHub Issues](https://github.com/Azure/azure-sdk-for-js/issues) and make sure you add the 'Preview' label to the issue.
