## Installation

`npm install rax-ssr-config`

## Parameters

**config**

* rootDir
* command command is 'start' or 'build'
* babelConfig

## Example

```
const getSSRBase = require('rax-ssr-config');
const getBabelConfig = require('rax-babel-config');

const babelConfig = getBabelConfig({
  styleSheet: true,
});

const config = getSSRBase({
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