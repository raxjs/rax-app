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

| param            | required | type    | default | explanation                                                  |
| ---------------- | -------- | ------- | ------- | ------------------------------------------------------------ |
| type             | N        | string  | project | build type,  'project' or 'component'                        |
| target           | N        | stirng  | miniapp | build target, 'miniapp' or 'wechat-miniprogram'              |
| entry            | N        | string  | src/app | entry file path                                              |
| distDir          | N        | string  | /       | file output directory, if not set, files will be output by build-plugin-rax-app/component's strategy |
| constantDir      | N        | array   | /       | Static file directories                                      |
| disableCopyNpm   | N        | boolean | false   | disable copy npm modules                                     |
| turnOffSourceMap | N        | boolean | false   | turn off source map. Only valid in dev mode                  |

