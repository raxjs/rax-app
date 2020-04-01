# rax-multi-pages-settings

## Usage

* setConfig: update MPA webpack config;
* setDevLog: set MPA Dev Server Logs;

```js
// Support web and weex.
onGetWebpackConfig('web', (config) => {

  setConfig(config, context, 'web');
});
```
