# Changelog

## 7.0.5

- Fix: avoid override developer custom title
- Fix: dynamic import script crossorigin property
- Fix: windows path error
- Fix: css-modules should not add to normal css file

## 7.0.4

- Fix: Remove error message when using mpa mode with webview miniapp

## 7.0.3

- Fix: page component import method in the env other than web
- Fix: override developer custom title

## 7.0.2

- Fix: special SPA route.path

## 7.0.1

- Feat: add class property validator for ts file

## 7.0.0

- Feat: upgrade dependencies for webpack 5
- Feat: add more tip during developing
- Feat: only need set `web.mpa` to make multiple app to MPA
- Feat: support swc
- Feat: support more compressor

## 6.4.7

- Chore: lock webpackbar version for avoid minimum node version error

## 6.4.6

- Feat: merge postcssOptions support

## 6.4.5

- Fix: tabbar state update

## 6.4.4

- Fix: ssr inline style

## 6.4.3

- Feat: add config option `forceEnableCSS` support

## 6.4.2

- Fix: tabBar height in iphoneX

## 6.4.1

- Chore: optimize `devServer.contentBase` and `output.path` logic
- Fix: print `devServer.host` in console higher priority

## 6.4.0

- Feat: add `exportsField` polyfill
- Chore: change custom tab bar path to `src/components/CustomTabBar/index`

## 6.3.2

- Feat: update dev and build log method for miniapps

## 6.3.1

- Chore: use constants from miniapp-builder-shared

## v6.3.0

- Feat: support custom tab bar in MPA

## v6.2.11

- Feat: add cli options `--analyzer-target`
- Feat: support ssr css-module
- Chore: remove print local url in console

## v6.2.10

- Chore: rax-webpack-config update

## v6.2.9

- Chore: upgrade less version

## v6.2.8

- Feat: support PHA multiple page dev urls
- Chore: add `stylesheet-loader` as dependencies

## v6.2.7

- Chore: update rax-webpack-config version

## v6.2.6

- Fix: imported css rpx unit converted fail

## v6.2.5

- Fix: app.json watch
- Chore: delete `MiniCssExtractPlugin` when `inlineStyle` mode
