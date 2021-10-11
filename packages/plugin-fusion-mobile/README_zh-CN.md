# build-plugin-fusion-mobile

一个在 Rax 项目中移除 [Fusion Mobile](https://www.npmjs.com/package/@alifd/meet) 组件库未使用代码的插件，用以缩减 bundle size。

## 使用

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

> **注意:** 当 `extractModules` 设置为 `true` 时，组件的默认主题会移除，需要手动引入主题，有两种方式：
>
> 1. npm 包自带主题：`@alifd/meet/es/core/index.css`
> 2. 用户定制的主题： @alife/mobile-theme-default/index.css (可自行在 [Fusion](https://fusion.alibaba-inc.com/mobile/) 创建)

## 配置项

### extractModules

所有环境均有效，使用 [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import) 抽取有效代码

默认值: `true`

### transformCssVariables

**仅小程序中生效**，将主题中的 css variables 转换为静态值，以缩减 css 文件的 bundle size (对应: build.css.acss, build.css.wxss)

默认值: `false`

如：

```css
:root {
  --color-brand-3: #209bfa;
}

.mt-button {
  background-color: var(--color-brand-3);
}
```

转换为

```css
.mt-button {
  background-color: #209bfa;
}
```

## Changelog

[更新日志](./CHANGELOG.md)
