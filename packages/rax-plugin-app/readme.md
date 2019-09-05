# rax-plugin-app

用于构建 rax 官方app，支持本地开发和构建

[]()<a name="ec09647d"></a>
## 使用方法

```json
{
  "plugins": [
    ["rax-plugin-app", {"targets": ["web", "weex", "miniapp"]}]
  ]
}
```

[]()<a name="4e530c4c"></a>
## 插件配置

写在插件 options 参数位置的配置

<a name="targets"></a>
### targets

- 类型：`array`
- 默认值：无

表示app 会被构建到哪几个平台，目前支持`web`, `weex`, `miniapp`平台

[]()<a name="b6453aea"></a>
## 基础配置

写在`build.json`顶层的配置

<a name="inlineStyle"></a>
### inlineStyle

- 类型：`boolean`
- 默认值：`true`

编译时是否转换为行内样式，开启时会将 css 文件内样式会通过行内样式的应用到节点上

<a name="extraStyle"></a>
### extraStyle

- 类型: `object`
- 默认值: `{}`

在inlineStyle为false时css的一些额外配置项

| name | type | desc | default |
|---|---|---|---|
| modules | boolean | 是否开启cssModules | false |
| resourceQuery | string | 不被编译为cssModules的文件后缀 | "raw" |

开启css modules后的写法为
```jsx
import './global.css?raw';
import styles from './index.css';

render(<div className={styles.css_module_class + ' global_class'}>test</div>,document.body);

```

<a name="analyzer"></a>
### analyzer

- 类型: `boolean`
- 默认值: `/`

默认不开启，为true时启用[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)插件对bundle进行文件内容分析，

<a name="publicPath"></a>
### publicPath

- 类型：`string`
- 默认值：`/`

尽在构建时生效，构建后资源公共路径，对应 webpack 的 [output.publicPath](https://webpack.js.org/configuration/output/#output-publicpath)

<a name="devPublicPath"></a>
### devPublicPath

- 类型：`string`
- 默认值：`/`

同publicPath， 仅在开发时生效

<a name="outputDir"></a>
### outputDir

- 类型：`string`
- 默认值：`build`

构建后的文件目录

<a name="exclude"></a>
### exclude

- 类型：`boolean | string`
- 默认值：`node_modules`

不进行编译的目录，配置为`false`时会编译用到的所有文件

<a name="hash"></a>
### hash

- 类型：`boolean | string`
- 默认值：`false`

构建后资源是否带上 hash 标签，默认不添加

<a name="devServer"></a>
### devServer

- 类型：`object`
- 默认值：

```javascript
{
  compress: true,
  disableHostCheck: true,
  clientLogLevel: 'error',
  hot: true,
  quiet: true,
  overlay: false,
  host: address.ip(),
  port: 9999,
}
```

配置 webpack 的 devServer 项，详见[DevServer](https://webpack.js.org/configuration/dev-server/)
