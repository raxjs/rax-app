# rax-scripts [![npm](https://img.shields.io/npm/v/rax-scripts.svg)](https://www.npmjs.com/package/rax-scripts)

Rax official engineering tool.

`rax-scripts` is based on webpack, supports various scenarios through the plugin system, and provides flexible webpack configuration capabilities based on `webpack-chain`. Users can realize engineering requirements by combining various plugins.

## Quick start

### 1. Install

```bash
$ npm install rax-scripts --save-dev
```

### 2. Configuration `build.json`

`rax-scripts` Itself will not perform any operations, but according plugins configured in build.json to execute engineering commands, for example, an ordinary webapp project configuration is as follows

```json
{
  "plugins": [
    ["rax-plugin-app", { "targets": ["web"]}]
  ]
}
```
