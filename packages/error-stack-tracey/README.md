# error-stack-tracey [![npm](https://img.shields.io/npm/v/error-stack-tracey.svg)](https://www.npmjs.com/package/error-stack-tracey)

Trace error stack with sourcemap.

## Usage

```js
const { parse, print } = require('error-stack-tracey');

// Parse the error stack
const errorStack = await parse(error, bundleContent);

// Print the error stack
print(errorMessage, errorStack);
```
