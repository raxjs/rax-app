### miniapp-runtime-config
小程序运行时工程公共配置设置。

### 参数

| 参数       | 类型   | 默认值 | 必填 | 描述                                                         |
| ---------- | ------ | ------ | ---- | ------------------------------------------------------------ |
| config     | object | -      | ✔️    | webpack chain config                                         |
| userConfig | object | {}     |  ✘   | 当前小程序平台的用户配置，例如 `{ nativeConfig: { appId: 123 } }` |
| options    | object | -      | ✔️    | options 子项见下表                                           |


#### options 子项

| 参数          | 类型   | 默认值 | 必填 | 描述                                                         |
| ------------- | ------ | ------ | ---- | ------------------------------------------------------------ |
| context       | object | -      | ✔️    | build plugin 上下文变量，包含运行时的各种环境信息            |
| target        | string | -      | ✔️    | 构建的小程序平台类型，例如 `miniapp`/`wechat-miniprogram`    |
| babelRuleName | string | babel      | ✘     | webpack chain config 中设置的 babel-loader 规则别名，例如 `config.rule('jsx').use('babel').loader(require.resolve('babel-loader'))`，此时 `babelRuleName` 值为 `babel` |

### 使用

```js
const { setConfig } = require('miniapp-runtime-config');

setConfig(config, userConfig, { context, target, babelRuleName });
```
