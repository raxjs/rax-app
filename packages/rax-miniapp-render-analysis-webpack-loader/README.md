# rax-miniapp-render-analysis-webpack-loader

<a href="https://travis-ci.com/raxjs/rax-scripts"><img src="https://travis-ci.com/raxjs/rax-scripts.svg?branch=master"></a>

[简体中文](./README-zh.md)

🚀 This is a really ground-breaking tool for Rax MiniApp. We can optimize the miniapp code to a greater extent.

## Why?

### Rax miniapp compile-time solution

Developer really need a better error notification. When they use a non-standard syntax, they don't know where they should amendment.

### Rax miniapp runtime solution

#### Native LifeCycle

In Rax miniapp runtime solution, we must know in advance which native life cycles developer has used.
In the past, we will register the entire miniapp native life cycle. This will have a certain impact on performance and even lead to memory leaks.

#### Used Built-in Components

In this solution, we have to traverse all the built-in components of the miniapp. This will have a certain impact on performance and generate a lot of invalid code. But now, we can get this information in the pre-compilation stage.

#### Used Native Component or Npm Component wrotten in native

We can get all component information in the pre-compilation stage.

## And More
Pre-complie can bring us more optimization possibilities. We will continue to add.
