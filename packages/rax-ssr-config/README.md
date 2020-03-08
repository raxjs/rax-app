## Installation

`npm install rax-ssr-config`

## Parameters

**config**

* rootDir
* command command is 'start' or 'build'
* babelConfig

## Example

```
const getSSRBaseConfig = require('rax-ssr-config');

const config = getSSRBaseConfig({
  ...context,
  output: {
    fileName: 'nsr/[name].js',
    libraryTarget: 'umd'
  }
});

```