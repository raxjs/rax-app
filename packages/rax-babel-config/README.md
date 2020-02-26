# rax-babel-config [![npm](https://img.shields.io/npm/v/rax-babel-config.svg)](https://www.npmjs.com/package/rax-babel-config)

## Installation

`npm install rax-babel-config`

## Parameters

**config**

* config.styleSheet use transform jsx stylesheet plugin
* config.jsxPlus use transform jsx+ plugins
* config.jsxToHtml use transform jsx to html plugin
* config.isNode preset-env targets is node
* config.disableRegenerator transform runtime config regenerator

## Example

```
const getBabelConfig = require('rax-babel-config');

const babelConfig = getBabelConfig({
  styleSheet: true,
});
```