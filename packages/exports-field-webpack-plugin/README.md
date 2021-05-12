# Exports Field webpack plugin

Support [package-exports](https://webpack.js.org/guides/package-exports/) in webpack4.

## Install

```bash
$ npm install @builder/exports-field-webpack-plugin
```

## Usage

You can use it with webpack chain as:

```js
const ExportsFieldWebpackPlugin = require('@builder/exports-field-webpack-plugin').default;

config.plugin('ExportsFieldWebpackPlugin').use(ExportsFieldWebpackPlugin, [
  {
    conditionNames: new Set(['web']),
  },
]);
```

it will only load module with `web` condition path which define in module's package.json `exports` field.

## Appreciation

This plugin is inspired by `enhanced-resolve` that creates webpack resolver.
