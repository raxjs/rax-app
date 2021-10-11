# build-plugin-fusion-mobile

Plugin for rax app using [Fusion Mobile](https://www.npmjs.com/package/@alifd/meet)

[中文文档](./packages/plugin-fusion-mobile/README_zh-CN.md)

## Usage

`build.json`

```json
{
  "plugins": [
    [
      "build-plugin-fusion-mobile",
      {
        "extractModules": true,
        "transformCssVariables": true
      }
    ]
  ]
}
```

## config

### extractModules

use [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import) to extract component code for @alifd/meet, @alifd/meet-react

default: `true`

### transformCssVariables

[**work in miniapp only**] tranform css variables into static values for miniapp css bundles, such as `bundle.css.wxss`, `bundle.css.acss`.

default: `false`

eg：

```css
:root {
  --color-brand-3: #209bfa;
}

.mt-button {
  background-color: var(--color-brand-3);
}
```

will get

```css
.mt-button {
  background-color: #209bfa;
}
```
