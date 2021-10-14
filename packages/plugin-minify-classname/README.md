# build-plugin-minify-classname

Minify your css modules classnames to get a smaller bundle size

## Usage

```js
{
  "plugins": [
    // ...
   "build-plugin-minify-classname"
  ]
}
```
## How

If we have a css modules file named `src/components/button/index.module.scss`

Suppose there are many selectors in it

```css
.foo {}
.bar {}
// ...
```

The result in miniapp projects

```css
.a54755bb1 {}
.b54755bb1 {}
// ...
```

The result in other projects

```css
.a-a_mc {}
.b-a_mc {}
// ...
```

## Why not [hash:base64:7]

As `54755bb1` here is repeated many times, it's better for `gzip`-like algorithm to generate a smaller size bundle