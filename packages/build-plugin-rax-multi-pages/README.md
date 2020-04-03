# build-plugin-multi-pages [![npm](https://img.shields.io/npm/v/build-plugin-multi-pages.svg)](https://www.npmjs.com/package/build-plugin-multi-pages)

`build-scripts` plugin which make rax app generate multiple html files.

## Warning!
Package "build-plugin-rax-multi-pages" has been deprecated.
Please use type: "mpa". example: 

```json
// app.json
{
  "plugins": [
    [
      "build-plugin-rax-app",
      {
        "targets": ["web"],
        "type": "mpa"
      }
    ]
  ]
}    
```

See: [https://rax.js.org/docs/guide/rax-plugin-app](https://rax.js.org/docs/guide/rax-plugin-app)

## Usage

```json
{
  "plugins": [
    ["build-plugin-rax-app", {"targets": ["web"]}],
    "build-plugin-rax-multi-pages"
  ]
}
```
