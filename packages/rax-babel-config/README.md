# rax-babel-config [![npm](https://img.shields.io/npm/v/rax-babel-config.svg)](https://www.npmjs.com/package/rax-babel-config)

## Installation

`npm install rax-babel-config`

## Parameters

**config**

* styleSheet： transform jsx stylesheet plugin
* jsxPlus： transform jsx+ plugins
* jsxToHtml： transform jsx to html plugin
* isNode： preset-env targets is node
* disableRegenerator： transform runtime config regenerator

## Example

```
const getBabelConfig = require('rax-babel-config');

const babelConfig = getBabelConfig({
  styleSheet: true,
});
```