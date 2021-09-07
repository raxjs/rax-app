# build-plugin-minify-classname

Minify your css modules classnames to get a smaller bundle size

## Usage

```json
{
  "plugins": [
    // ...
   [
     "build-plugin-minify-classname",
     {
       useHash: true, // use hash or not, true by default
       prefix: '', // add prefix for every classname
       suffix: '', // add suffix for every classname
     }
   ]
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