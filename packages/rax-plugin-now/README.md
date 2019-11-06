# rax-plugin-now [![npm](https://img.shields.io/npm/v/rax-plugin-now.svg)](https://www.npmjs.com/package/rax-plugin-now)


`rax-scripts` plugin which make rax server-side render app can be deployed by [now](https://zeit.co/home)

## Usage

```json
{
  "plugins": [
    ["rax-plugin-app", {"targets": ["web"]}],
    "rax-plugin-ssr"
    "rax-plugin-now"
  ]
}
```
