# jsx2mp

> an API wrapper for building Rax miniapp app and component

## Usage

```js
const { start, build } = require('jsx2mp');

// Dev mode
await start(options);

// Build mode
await build(options);
```

## options

| param          | required | type     | default | explanation                                                  |
| -------------- | -------- | -------- | ------- | ------------------------------------------------------------ |
| buildType      | N        | string   | compile | Build type, 'compile'  or 'runtime' <br />**Attention:** <br />1.  `type`/`constantDir`/`disableCopyNpm`/`turnOffSourceMap` are only valid in compile mode<br />2. BuildType is only valid when type is 'project' |
| type           | N        | string   | project | Build type,  'project' or 'component'                        |
| target         | N        | stirng   | miniapp | Build target, 'miniapp' or 'wechat-miniprogram'              |
| entry          | N        | string   | src/app | Entry file path                                              |
| distDir        | N        | string   | /       | File output directory, if not set, files will be output by build-plugin-rax-app/component's strategy |
| constantDir    | N        | array    | /       | Static file directories                                      |
| disableCopyNpm | N        | boolean  | false   | Disable copy npm modules                                     |
| configWebpack  | N        | function | /       | Used for add webpack config, get the argument `config` which is the webpack-chain config instance |
| dualEngine     | N        | boolean | true       | Whether use compile component in runtime mode, only valid in runtime mode |


Options below are only valid in dev mode: 

| param            | required | type    | default | explanation                                                  |
| ---------------- | -------- | ------- | ------- | ------------------------------------------------------------ |
| turnOffSourceMap | N        | boolean | false   | Turn off source map. Only valid in dev mode                  |
| afterCompiled    | N        | funtion | /       | Executed after compiling finished every time, get the following argument: <br />{<br/> url: string // serverUrl，<br/> stats: WebpackAssets<br/>} |

