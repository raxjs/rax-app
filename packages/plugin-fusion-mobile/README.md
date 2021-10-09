# build-plugin-fusion-mobile

Plugin for rax app using [Fusion Mobile](https://www.npmjs.com/package/@alifd/meet)

[中文文档](./README_zh-CN.md)

## Usage

`build.json`

```json
{
  "plugins": [
    [
      "build-plugin-fusion-mobile",
      {
        "extractModules": true,
        "transformCssVariables": true,
        "injectTheme": true,
        "themePackage": "@alife/mobile-theme-default"
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

### injectTheme

[**work in miniapp only**] set `true` to inject a default theme (`@alifd/meet/es/core/index.css`)

default: `true`

> **NOTICE:** when it set to be `false`, the page may render with exception because there is no theme config.
> Don't worry, you can import it manually:

```jsx
/* @jsx createElement */
import { createElement } from 'rax';
import { Button } from '@alifd/meet';

// 强制手动引入
import '@alifd/meet/es/core/index.css';

export default () => {
  return (
    <Button type="primary" model="outline">
      button
    </Button>
  );
};
```

### themePackage

[**work in miniapp only**] enable when `injectTheme=true`, inject the giving theme package

default: ''
