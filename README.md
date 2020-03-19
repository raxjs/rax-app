# Rax Scripts

Rax official engineering tools use `@alib/build-scripts` . `@alib/build-scripts` is based on webpack, supports various scenarios through the plugin system, and provides flexible webpack configuration capabilities based on `webpack-chain`. Users can realize engineering requirements by combining various plugins.

## Quick start

Install the latest version and initialize the project

```bash
$ npm init rax my-app
```

## Use by installation

```bash
$ npm install @alib/build-scripts --save-dev
```
Configuration `build.json`

```json
{
  "plugins": [
    ["build-plugin-rax-app", { "targets": ["web"]}]
  ]
}
```

## How to Write Plugin


`@alib/build-scripts` Itself will not perform any operations, but according plugins configured in build.json to execute engineering commands, for example, an ordinary webapp project configuration is as follows

The plugin needs to export a function. The function will receive two parameters. The first is the pluginAPI provided by build scripts, and the second is the user-defined parameter passed to the plugin

```js
module.exports = (pluginAPI, options) => {
  const { 
    context,
    log,
    onHook 
  } = pluginAPI;
};
```

### pluginAPI

* `context`: environment information (command、commandArgs、rootDir、userConfig、pkg)
* `onGetWebpackConfig`: You can modify the weback configuration in the form of weback chain
* `onHook`: Listening for command runtime events with `onHook`
* `log`: use npmlog
* `registerTask`: register webpack task
* `registerUserConfig`: Register the top-level configuration field in build.json for user field verification
* `registerCliOption`: cli config
* `setValue` & `getValue` Used to register variables in context for communication between plug-ins

### lifecycle

start

* `before.start.load`	Before getting the webpack configuration
* `before.start.run`	Before webpack execution
* `after.start.compile`	After compilation, every recompilation will be executed
* `before.start.devServer` After the middleware is loaded, before the webpack dev server is started
* `after.start.devServer`	After the webpack dev server is started

build

* `before.build.load`	Before getting the webpack configuration
* `before.build.run` Before webpack execution
* `after.build.compile`	End of build

## Plugin List

### build-plugin-rax-app

Build Single-page application (SPA)

### build-plugin-rax-multi-pages

Build Multi-page application (MPA)

### build-plugin-rax-component

Build universal component or universal API library

### build-plugin-rax-pwa

Build Progressive web application

### build-plugin-rax-ssr

Build  Server-side rendering application (SSR)
