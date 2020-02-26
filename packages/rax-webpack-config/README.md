# rax-webpack-config [![npm](https://img.shields.io/npm/v/rax-webpack-config.svg)](https://www.npmjs.com/package/rax-webpack-config)

## Installation

`npm install rax-webpack-config`

## Parameters

**config**

* rootDir
* command command is 'start' or 'build'
* babelConfig

## Example

```
const getWebpackBase = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');

const babelConfig = getBabelConfig({
  styleSheet: true,
});

const config = getWebpackBase({
  ...context, 
  babelConfig: babelConfig,
});

config.module.rule('tsx')
  .use('ts')
  .loader(require.resolve('ts-loader'))
  .options({
    transpileOnly: true,
  });

```