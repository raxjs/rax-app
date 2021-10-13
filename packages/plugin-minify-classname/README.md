# build-plugin-minify-classname

Minify your css modules classnames to get a smaller bundle size

## Usage

```js
{
  "plugins": [
    // ...
   [
     "build-plugin-minify-classname",
     options
   ]
  ]
}
```

## Options

### options.miniapp

Type: `Boolean`\
Default: `false`

Set `options.miniapp` to true if you are in a miniapp project. Internally it will use another minification strategy to gain a smaller size.

## How

If we have a css modules file named `src/components/button/index.module.scss`

Suppose there are many selectors in it

```css
.foo {}
.bar {}
// ...
```

In this plugin, selectors will be minified according to the sequence in the file with alphabet `abcdefg...`

And filepath `src/components/button/index.module.scss` will be minified as a hash string `"54755bb1"` by default

( You can also force filepath to use alphabet `abcdefg...`, with options: { useHash: false }, it will result in a smaller bundle, but be careful, it makes css bundle content changes between builds )

`foo` becomes `a`, `bar` becomes `b`

the output css looks like

```css
.a54755bb1 {}
.b54755bb1 {}
// ...
```

## Why not [hash:base64:7]

As `54755bb1` here is repeated many times, it's better for `gzip`-like algorithm to generate a smaller size bundle