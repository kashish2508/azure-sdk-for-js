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

We recommend reviewing the [complete guide](https://devblogs.microsoft.com/azure-sdk/azure-sdk-modularized-libraries-for-javascript/) for full details. Compared to libraries generated with *Autorest*, *TypeSpec code generation* has following key benefits:

1. Subpath exports: Libraries now leverage [subpath exports](https://nodejs.org/api/packages.html#subpath-exports) to provide layered APIs. This means developers can access the familiar `Client` at the root level while also using the `/api` subpath for fine-grained, operation-level imports.
1. Bundle size optimization: By leveraging the new `/api` subpath export, developers can selectively import only the operations they need. This approach minimizes the overall library footprint in the application bundle, ensuring that only the required pieces are included.
1. Long-running operations: Libraries generated from *TypeSpec* use the `@typespec/ts-http-runtime` poller model and may expose different LRO shapes than older AutoRest-based libraries. Check the generated client you're migrating to and follow its current API surface rather than assuming older `beginXxx`/`beginXxxAndWait` pairs still exist.


## How to migrate to libraries generated from TypeSpec

If you’re updating an existing application from **libraries generated with AutoRest** to **libraries generated from TypeSpec**, focus on these key areas:

1. **Long-running operations (LROs)** – Updated method signatures and poller behavior
2. **List operations (paging)** – Simplified continuation token handling

### Long-running Operations (LROs)

LRO behavior changed between AutoRest-generated and TypeSpec-generated libraries, but there is no single repo-wide migration shape. In this repository today, many TypeSpec-generated packages still expose `beginXxx` and `beginXxxAndWait` methods, while the underlying poller types and helper APIs differ from older AutoRest libraries.

When migrating LRO code:

- Inspect the current generated client in your target package.
- Prefer the convenience `beginXxxAndWait` method when the package exposes it and you only need the final result.
- Use the `beginXxx` poller form when you need progress, serialization, or manual polling.
- Follow the package's current `@azure/core-lro` / runtime poller APIs instead of assuming `SimplePollerLike`, `submitted()`, or `serialize()` are available.

For poller-specific migration details, see the current `core-lro` migration notes in this repo:  
https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/core/core-lro/docs/MIGRATION.md
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
