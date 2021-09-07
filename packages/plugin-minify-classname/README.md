# build-plugin-minify-classname

Minify your css modules classnames to get a smaller bundle size

## Usage

```js
{
  "plugins": [
    // ...
   [
     "build-plugin-minify-classname",
     {
       "useHash": true,
       "prefix": "",
       "suffix": "",
     }
   ]
  ]
}
```

## Options

### options.useHash

Type: `Boolean`\
Default: `true`

Use hash to minify filepath, set `useHash` to `false` will switch to alphabet

### options.prefix

Type: `String`\
Default: `""`

Add prefix for every css modules classname

### options.suffix

Type: `String`\
Default: `""`

Add suffix for every css modules classname

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

( You can also force filepath to use alphabet `abcdefg...`, with options: { useHash: false }, it will result in a better minification, but be careful, it makes css bundle content changes between builds )

So finally, `foo` will becomes `a`, `bar` will becomes `b`

the final css looks like

```css
.a54755bb1 {}
.b54755bb1 {}
// ...
```

## Why not [hash:base64:7]

As `54755bb1` here is repeated many times, so it's better for `gzip` to generate a smaller bundle

## Cautions

Don't use this plugin in your component project, because the minified classnames maybe conflict, but you can provide a `prefix` or `suffix` option to avoid the conflict