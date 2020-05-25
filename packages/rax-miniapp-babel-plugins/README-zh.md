# rax-miniapp-babel-plugins

<a href="https://travis-ci.com/raxjs/rax-scripts"><img src="https://travis-ci.com/raxjs/rax-scripts.svg?branch=master"></a>

[英文](./README.md)

🚀 我们可以在通过这些 babel 插件更大程度上优化生成的小程序代码。

## 为什么需要预编译?

### Rax 小程序运行时方案

#### 原生生命周期

在 Rax 小程序运行时解决方案中，我们可以提前知道开发者使用了哪个原生生命周期。过去，我们将注册整个小程序的原生生命周期。这将对性能产生一定影响，甚至导致内存泄漏。

#### 使用内置组件

在此解决方案中，我们必须遍历小程序的所有内置组件。这将对性能产生一定影响，并生成大量无效代码。但是现在，我们可以在预编译阶段获取此信息。

## 更多的
预编译可以为我们带来更多的优化可能性。我们将继续补充。
