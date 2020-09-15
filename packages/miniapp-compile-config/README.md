### miniapp-compile-config
小程序编译时工程公共配置设置。

### 方法
#### setAppConfig
##### 参数

| 参数       | 类型   | 默认值 | 必填 | 描述                                                         |
| ---------- | ------ | ------ | ---- | ------------------------------------------------------------ |
| config     | object | -      | ✔️    | webpack chain config                                         |
| userConfig | object | {}     |  ✘   | 当前小程序平台的用户配置，例如 `{ nativeConfig: { appId: 123 } }` |
| options    | object | -      | ✔️    | options 子项见下表     


##### options 子项

| 参数          | 类型   | 默认值 | 必填 | 描述                                                         |
| ------------- | ------ | ------ | ---- | ------------------------------------------------------------ |
| context       | object | -      | ✔️    | build plugin 上下文变量，包含运行时的各种环境信息            |
| target        | string | -      | ✔️    | 构建的小程序平台类型，例如 `miniapp`/`wechat-miniprogram`    |
| onGetWebpackConfig | function | -      | ✔️      | 在工程获取 webpack 时触发的函数，可以在 build plugin 的 api 中获取  |
| entryPath       | string | -      | ✔️    | 入口路径           |
| outputPath        | string | -      | ✔️    | 输出路径    |


#### setComponentConfig
##### 参数

| 参数       | 类型   | 默认值 | 必填 | 描述                                                         |
| ---------- | ------ | ------ | ---- | ------------------------------------------------------------ |
| config     | object | -      | ✔️    | webpack chain config                                         |
| userConfig | object | {}     |  ✘   | 当前小程序平台的用户配置，例如 `{ nativeConfig: { appId: 123 } }` |
| options    | object | -      | ✔️    | options 子项见下表     


##### options 子项

| 参数          | 类型   | 默认值 | 必填 | 描述                                                         |
| ------------- | ------ | ------ | ---- | ------------------------------------------------------------ |
| context       | object | -      | ✔️    | build plugin 上下文变量，包含运行时的各种环境信息            |
| target        | string | -      | ✔️    | 构建的小程序平台类型，例如 `miniapp`/`wechat-miniprogram`    |
| onGetWebpackConfig | function | -      | ✔️      | 在工程获取 webpack 时触发的函数，可以在 build plugin 的 api 中获取  |
| entryPath       | string | -      | ✔️    | 入口路径           |
| outputPath        | string | -      | ✔️    | 输出路径    |

### 使用

```js
const { setAppConfig, setComponentConfig } = require('miniapp-compile-config');

// 应用
setAppConfig(config, userConfig, { context, target, onGetWebpackConfig, entryPath, outputPath });

// 组件
setComponentConfig(config, userConfig, { context, target, onGetWebpackConfig, entryPath, outputPath });
```
