`build-scripts` plugin config which make rax app generate multiple html files.

## Usage

* setConfig: update MPA webpack config;
* setDevServer: set MPA Dev Server;
* setDevLog: set MPA Dev Server Logs;

```js
// Support web and weex.
onGetWebpackConfig('web', (config) => {
  if (command === 'start') {
    // Set MPA Dev Server
    setDevServer({
      config,
      context,
      targets,
    });
  }

  setConfig(config, context, 'web');
});
```
