# Bundling Azure SDK libraries for a browser

To use Azure SDK libraries in a website, you need to bundle your application for the browser. A **bundler** converts the packages your app imports into browser-compatible assets.

This guide walks through the basics of bundling Azure SDK packages with a few common tools.

## Prerequisites

Install a current LTS version of [Node.js](https://nodejs.org/). The examples in this guide use npm because these commands target a standalone app outside this repository.

Verify your tools:

```sh
node --version
npm --version
```

## Setting up your project

If you already have a project with a `package.json`, skip to the next section.

```sh
mkdir example
cd example
npm init -y
```

Install the Azure SDK package you want to use. For example, to use Azure Blob Storage:

```sh
npm install @azure/storage-blob
```

## Choosing a bundler

Below are examples with [Webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org/), and [Parcel](https://parceljs.org/). Any bundler can work as long as it can bundle ESM/CommonJS packages and any browser polyfills your app needs.

## Using Webpack

Install webpack locally in your app:

```sh
npm install --save-dev webpack webpack-cli
```

### Webpack with JavaScript

Create `src/index.js`:

```js
const { BlobServiceClient } = require("@azure/storage-blob");
// Use BlobServiceClient here
```

Bundle the app:

```sh
npx webpack --mode=development
```

Webpack writes the bundle to `dist/main.js` by default.

Reference it from HTML:

```html
<script src="./dist/main.js"></script>
```

### Webpack with TypeScript

Install TypeScript support:

```sh
npm install --save-dev typescript ts-loader
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "outDir": "./dist/",
    "noImplicitAny": true,
    "strict": true,
    "module": "es6",
    "moduleResolution": "node",
    "target": "es6"
  }
}
```

Create `src/index.ts`:

```ts
import { BlobServiceClient } from "@azure/storage-blob";
// Use BlobServiceClient here
```

Create `webpack.config.js`:

```js
const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

Bundle the app:

```sh
npx webpack --mode=development
```

## Using Rollup

Install Rollup locally in your app:

```sh
npm install --save-dev rollup
```

### Rollup with JavaScript

Create `src/index.js`:

```js
import { SomeClient } from "@azure/some-sdk-package";
// Use the client here
```

Create `rollup.config.mjs`:

```js
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "esm",
    name: "main"
  },
  plugins: [nodeResolve({ browser: true })]
};
```

Install the plugin:

```sh
npm install --save-dev @rollup/plugin-node-resolve
```

For packages with additional runtime requirements, you may need a more complex Rollup configuration.

For example, bundling `@azure/storage-blob` may require CommonJS, JSON, and browser shims:

```js
import resolve from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import shim from "rollup-plugin-shim";

export default {
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "esm",
    name: "main"
  },
  plugins: [
    shim({
      fs: `
      export function stat() {}
      export function createReadStream() {}
      export function createWriteStream() {}
    `,
      os: `
      export const type = 1;
      export const release = 1;
    `,
      util: `
      export function promisify() {}
    `
    }),
    resolve({
      preferBuiltins: false,
      mainFields: ["module", "browser"]
    }),
    cjs({
      namedExports: {
        events: ["EventEmitter"]
      }
    }),
    json()
  ]
};
```

Install the plugins used in that configuration:

```sh
npm install --save-dev @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-json rollup-plugin-shim
```

Run Rollup:

```sh
npx rollup --config
```

### Rollup with TypeScript

Install the dependencies:

```sh
npm install --save-dev typescript @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-json rollup-plugin-shim rollup-plugin-typescript2
```

Create `src/index.ts`:

```ts
import { BlobServiceClient } from "@azure/storage-blob";
// Use BlobServiceClient here
```

Create `rollup.config.mjs`:

```js
import resolve from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import shim from "rollup-plugin-shim";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "esm",
    name: "main"
  },
  plugins: [
    shim({
      fs: `
      export function stat() {}
      export function createReadStream() {}
      export function createWriteStream() {}
    `,
      os: `
      export const type = 1;
      export const release = 1;
    `,
      util: `
      export function promisify() {}
    `
    }),
    resolve({
      preferBuiltins: false,
      mainFields: ["module", "browser"]
    }),
    cjs({
      namedExports: {
        events: ["EventEmitter"]
      }
    }),
    json(),
    typescript()
  ]
};
```

Run Rollup:

```sh
npx rollup --config
```

## Using Parcel

Install Parcel locally in your app:

```sh
npm install --save-dev parcel
```

### Parcel with JavaScript

Add a `browserslist` entry to `package.json`:

```json
"browserslist": [
  "last 1 Chrome version",
  "last 1 Firefox version",
  "last 1 Edge version"
]
```

If needed, also enable package exports resolution:

```json
"@parcel/resolver-default": {
  "packageExports": true
}
```

Create `index.js`:

```js
const { BlobServiceClient } = require("@azure/storage-blob");
// Use BlobServiceClient here
```

Create `index.html`:

```html
<!DOCTYPE html>
<html>
  <body>
    <script src="./index.js"></script>
  </body>
</html>
```

Run Parcel:

```sh
npx parcel index.html
```

To build without the dev server:

```sh
npx parcel build index.html
```

### Parcel with TypeScript

Install TypeScript:

```sh
npm install --save-dev typescript
```

Create `index.ts`:

```ts
import { BlobServiceClient } from "@azure/storage-blob";
// Use BlobServiceClient here
```

Create `index.html`:

```html
<!DOCTYPE html>
<html>
  <body>
    <script src="./index.ts"></script>
  </body>
</html>
```

Run Parcel:

```sh
npx parcel index.html
```

To build without the dev server:

```sh
npx parcel build index.html
```

## Examples

For working Azure SDK browser scenarios, see package samples under `sdk/*/*/samples` and `samples-dev` in this repository, plus the package READMEs for browser support notes.
