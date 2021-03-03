## rax-app-codemod

This repository contains a collection of codemod scripts for use with [JSCodeshift](https://github.com/facebook/jscodeshift) that help update Rax App.

### Usage

```bash
npx rax-app-codemod <transform> <path> <...options>
```

- `transform` - name of transform, see available transforms below.
- `path` - files or directory to transform, default value is current dir.

### Included Transforms

#### `project`

Converts `build-plugin-rax-app@0.x` ~ `build-plugin-rax-app@5.x` into `rax-app@3.x`.

```bash
npx rax-app-codemod project <path>
```
