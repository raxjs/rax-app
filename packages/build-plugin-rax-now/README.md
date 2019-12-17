# build-plugin-rax-now [![npm](https://img.shields.io/npm/v/build-plugin-rax-now.svg)](https://www.npmjs.com/package/build-plugin-rax-now)


`build-scripts` plugin which make rax server-side render app can be deployed by [now](https://zeit.co/home)

## Usage

```json
{
  "plugins": [
    ["build-plugin-rax-app", {"targets": ["web"]}],
    "build-plugin-rax-ssr"
    "build-plugin-rax-now"
  ]
}
```
