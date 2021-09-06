# 组件工程升级

## 从 plugin-rax-component 升级到 plugin-component

升级原因：

- 为了保证 React&Rax 组件工程能力一致，我们将 plugin-rax-component 统一合并到 plugin-component 上
- Rax 组件工程对原先工程能力进行的全面升级，更加合理地组织组件目录，并提供重构优化了组件构建和文档预览能力

### 修改 package.json 依赖

组件工程依赖插件从 `build-plugin-rax-component` 升级为 `build-plugin-component`：

```diff
{
-  "build-plugin-rax-component": "^0.2.14",
+  "build-plugin-component": "^1.0.0"
}
```

### 修改 build.json 配置

原先 `build-plugin-rax-component` 组件配置项，均升级为顶层配置

```diff
{
+  "type": "rax",
+  "targets": ["web"],
+  "inlineStyle": true,
  "plugins": [
-    ["build-plugin-rax-component", {
-      "type": "rax",
-      "targets": ["web"],
-      "forceInline": true
-    }]
+    "build-plugin-component"
  ]
}
```

> forceInline 配置变更为 inlineStyle，通过 Rax 工程配置保持一致

### 目录结构变化

```diff
  ├── demo                      # 组件 demo
- │    ├── miniapp
- │    ├── wechat-miniprogram
- │    ├── index.jsx
+ │    ├── simple.md
+ │    └── usage.md
+ ├── miniapp-demo              # 小程序 demo 调试代码（可选）
+ │    └── index.tsx
  ├── src                       # 组件源码
  │    └── index.tsx
  ├── build.json                # 构建配置
  ├── lib/                      # 构建产物，编译为 ES5 的代码
  ├── es/                       # 构建产物，编译为 es module 规范的代码
  ├── build/                    # 构建产物，用于组件文档/demo 预览
  ├── README.md
  └── package.json
```

具体变更内容如下：

1. 小程序相关的模版代码将自动生成，原 miniapp 目录移除，如果有自定义小程序 props 属性的测试需求，可以增加 miniapp-demo 目录
2. demo 目录下不再支持 index.j|tsx 文件，demo 文件均采用 \*.md

如组件工程迁移过程中遇到问题请通过 [issue](https://github.com/raxjs/rax-app) 进行反馈。
