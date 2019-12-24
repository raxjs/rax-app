# @alib/build-scripts [![npm](https://img.shields.io/npm/v/@alib/build-scripts.svg)](https://www.npmjs.com/package/@alib/build-scripts)

Rax official engineering tool.

`@alib/build-scripts` is based on webpack, supports various scenarios through the plugin system, and provides flexible webpack configuration capabilities based on `webpack-chain`. Users can realize engineering requirements by combining various plugins.

## Quick start

### 1. Install

```bash
$ npm install @alib/build-scripts --save-dev
```

### 2. Configuration `build.json`

`@alib/build-scripts` Itself will not perform any operations, but according plugins configured in build.json to execute engineering commands, for example, an ordinary webapp project configuration is as follows

```json
{
  "plugins": [
    ["build-plugin-rax-app", { "targets": ["web"]}]
  ]
}
```
