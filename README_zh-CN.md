[English](./README.md) | 简体中文

<p align="center">
  <a href="https://www.npmjs.com/package/rax-app"><img src="https://badgen.net/npm/dm/rax-app" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/rax-app"><img src="https://badgen.net/npm/v/rax-app" alt="Version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
  <a href="https://github.com/raxjs/rax-scripts/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  <a href="https://gitter.im/raxjs/rax-scripts"><img src="https://badges.gitter.im/raxjs/rax-scripts.svg" alt="Gitter" /></a>
</p>

> 基于 Rax 的多端研发框架

## 特性

- 🐂  **多端**：支持 Web、小程序、Kraken 等容器运行
- 🐴  **完整的应用生命周期**：提供 usePageShow、usePageHide 等钩子
- 🐒  **工程**：开箱即用的工程配置，支持 ES6+、TypeScript、样式方案（Less/Sass/CSS Modules）等
- 🦊  **路由**：默认使用配置式路由，同时支持约定式路由
- 🐯  **数据流**：内置集成 icestore，基于 React Hooks 的轻量级状态管理方案
- 🐦  **环境配置**：内置集成 config， 支持多环境变量的配置
- 🦁  **应用配置**：提供强大的和可扩展的应用程序配置
- 🐌  **插件体系**：提供插件机制，可以扩展框架的核心功能
- 🐘  **TypeScript**：默认使用 TypeScript 

## 快速开始

### 使用 Iceworks 创建项目

我们推荐你安装 [Iceworks](https://marketplace.visualstudio.com/items?itemName=iceworks-team.iceworks)，然后通过该插件的引导进行项目的创建：

![使用示例](https://img.alicdn.com/tfs/TB13Wk.11H2gK0jSZJnXXaT1FXa-1478-984.png)

> 参考[《Iceworks 快速开始》](https://ice.work/docs/iceworks/quick-start)了解更多细节。

### 使用 CLI 创建项目

创建项目

```bash
$ npm init rax <project-name>
```

`npm init <initializer>` 需要 npm 6+ 版本

启动项目

```bash
$ cd <project-name>
$ npm install
$ npm run start # running on http://localhost:3333.
```

## 项目示例

- [basic-spa](https://github.com/raxjs/rax-scripts/tree/master/examples/basic-spa)
- [with-rax-mpa](https://github.com/raxjs/rax-scripts/tree/master/examples/with-rax-mpa)
- [with-rax-store](https://github.com/raxjs/rax-scripts/tree/master/examples/with-rax-store)
- [with-rax-miniapp-compile](https://github.com/raxjs/rax-scripts/tree/master/examples/with-rax-miniapp-compile)


## 生态

|    Project         |    Version                                 |     Docs    |   Description       |
|----------------|-----------------------------------------|--------------|-----------|
| [rax]| [![rax-status]][rax-package] | [docs][rax-docs] |用于构建移动跨端应用的渐进式 React 框架|
| [rax-app] | [![rax-app-status]][rax-app-package] | [docs][rax-app-docs] | 基于 Rax 的跨终端研发框架 |
| [miniapp] | [![miniapp-status]][miniapp-package] | [docs][miniapp-docs] | 基于 Rax 的小程序双引擎方案 |
| [icestore] | [![icestore-status]][icestore-package] | [docs][icestore-docs] | 简单友好的轻量级状态管理方案 |
| [iceworks]| [![iceworks-status]][iceworks-package] | [docs][iceworks-docs] | 可视化智能开发助手 |

[rax]: https://github.com/alibaba/rax
[rax-app]: https://github.com/raxjs/rax-scripts
[miniapp]: https://github.com/raxjs/miniapp
[icestore]: https://github.com/ice-lab/icestore
[iceworks]: https://github.com/ice-lab/iceworks

[rax-status]: https://img.shields.io/npm/v/rax.svg
[rax-app-status]: https://img.shields.io/npm/v/rax-app.svg
[miniapp-status]: https://img.shields.io/npm/v/miniapp-render.svg
[icestore-status]: https://img.shields.io/npm/v/@ice/store.svg
[iceworks-status]: https://vsmarketplacebadge.apphb.com/version/iceworks-team.iceworks.svg

[rax-package]: https://npmjs.com/package/rax
[rax-app-package]: https://npmjs.com/package/rax-app
[miniapp-package]: https://npmjs.com/package/miniapp-render
[icestore-package]: https://npmjs.com/package/@ice/store
[iceworks-package]: https://marketplace.visualstudio.com/items?itemName=iceworks-team.iceworks

[rax-docs]: https://rax.js.org/docs/guide/about
[rax-app-docs]: https://rax.js.org/docs/guide/directory-structure
[miniapp-docs]: https://rax.js.org/miniapp
[icestore-docs]: https://github.com/ice-lab/icestore#icestore
[iceworks-docs]: https://ice.work/docs/iceworks/about


## 社区

| 钉钉群                               | GitHub issues |  Gitter |
|-------------------------------------|--------------|---------|
| <a href="https://img.alicdn.com/tfs/TB1xmE8p7T2gK0jSZPcXXcKkpXa-387-505.png"><img src="https://img.alicdn.com/tfs/TB1xmE8p7T2gK0jSZPcXXcKkpXa-387-505.png" width="150" /></a> | [issues]     | [gitter]|

[issues]: https://github.com/raxjs/rax-scripts/issues
[gitter]: https://gitter.im/rax-scripts/rax-scripts

