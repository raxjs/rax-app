English | [简体中文](./README_zh-CN.md)

<p align="center">
  <a href="https://www.npmjs.com/package/rax-app"><img src="https://badgen.net/npm/dm/rax-app" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/rax-app"><img src="https://badgen.net/npm/v/rax-app" alt="Version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license" /></a>
  <a href="https://github.com/raxjs/rax-scripts/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
  <a href="https://gitter.im/raxjs/rax-scripts"><img src="https://badges.gitter.im/raxjs/rax-scripts.svg" alt="Gitter" /></a>
</p>

> An universal framework based on Rax

## Features

- 🐂**Universal**：Support Web/MiniApp/Kraken
- 🐴 **App lifecycle**：Provide usePageShow、usePageHide etc.
- 🐒 **Engineering**：Out of the box support for ES6+、TypeScript、Less、Sass、 CSS Modules，etc
- 🦊 **Routing**：Powerful Routing System, supports configured routing and conventions routing
- 🐯 **State management**：Built-in icestore, lightweight state management solution based on React Hooks
- 🐦 **Config**：Modes and Environment Variables configuration in the config file
- 🦁 **Application configuration**：Provide powerful and extensible application configuration
- 🐌 **Plugin system**：The plugin system provides rich features and allow the community to build reusable solutions
- 🐘 **TypeScript**：Support TypeScript

## Quick start

### Setup by Iceworks

We recommend creating a new icejs app using [Iceworks](https://marketplace.visualstudio.com/items?itemName=iceworks-team.iceworks):

![demo](https://img.alicdn.com/tfs/TB13Wk.11H2gK0jSZJnXXaT1FXa-1478-984.png)

> See [Quick start by Iceworks](https://ice.work/docs/iceworks/quick-start) for more details.

### Setup by CLI

We recommend creating a new icejs app using create-ice, which sets up everything automatically for you. To create a project, run:

```bash
$ npm init ice <project-name>
```

`npm init <initializer>` is available in npm 6+

Start local server to launch project:

```bash
$ cd <project-name>
$ npm install
$ npm run start # running on http://localhost:3333.
```

It's as simple as that!


## Examples

- [with-rax](https://github.com/raxjs/rax-scripts/tree/master/examples/with-rax)
- [with-rax-mpa](https://github.com/raxjs/rax-scripts/tree/master/examples/with-rax-mpa)
- [with-rax-store](https://github.com/raxjs/rax-scripts/tree/master/examples/with-rax-store)
- [with-rax-miniapp-compile](https://github.com/raxjs/rax-scripts/tree/master/examples/with-rax-miniapp-compile)


## Ecosystem

|    Project         |    Version                                 |     Docs    |   Description       |
|----------------|-----------------------------------------|--------------|-----------|
| [rax]| [![rax-status]][rax-package] | [docs][rax-docs] | Progressive React framework for building universal application|
| [rax-app] | [![rax-app-status]][rax-app-package] | [docs][rax-app-docs] | An universal framework based on rax.js |
| [miniapp] | [![miniapp-status]][miniapp-package] | [docs][miniapp-docs] | An mordern and high performance miniapp solution based on rax-app |
| [icestore] | [![icestore-status]][icestore-package] | [docs][icestore-docs] |Simple and friendly state for React like |
| [iceworks]| [![iceworks-status]][iceworks-package] | [docs][iceworks-docs] |Visual Intelligent Development Assistant|

[rax]: https://github.com/alibaba/rax
[rax-app]: https://github.com/raxjs/rax-scripts
[icestore]: https://github.com/ice-lab/icestore
[iceworks]: https://github.com/ice-lab/iceworks

[rax]: https://img.shields.io/npm/v/rax.svg
[rax-app]: https://img.shields.io/npm/v/rax-app.svg
[icestore-status]: https://img.shields.io/npm/v/@ice/store.svg
[iceworks-status]: https://vsmarketplacebadge.apphb.com/version/iceworks-team.iceworks.svg

[rax-package]: https://npmjs.com/package/rax
[rax-app-package]: https://npmjs.com/package/rax-app
[icestore-package]: https://npmjs.com/package/@ice/store
[iceworks-package]: https://marketplace.visualstudio.com/items?itemName=iceworks-team.iceworks

[rax-docs]: https://rax.js.org/docs/guide/about
[rax-app-docs]: https://rax.js.org/docs/guide/about
[icestore-docs]: https://github.com/ice-lab/icestore#icestore
[iceworks-docs]: https://ice.work/docs/iceworks/about

## Community

| DingTalk community                               | GitHub issues |  Gitter |
|-------------------------------------|--------------|---------|
| <a href="https://img.alicdn.com/tfs/TB1xmE8p7T2gK0jSZPcXXcKkpXa-387-505.png"><img src="https://img.alicdn.com/tfs/TB1xmE8p7T2gK0jSZPcXXcKkpXa-387-505.png" width="150" /></a> | [issues]     | [gitter]|

[issues]: https://github.com/raxjs/rax-scripts/issues
[gitter]: https://gitter.im/alibaba/rax-scripts

