# build-plugin-rax-faas [![npm](https://img.shields.io/npm/v/build-plugin-rax-faas.svg)](https://www.npmjs.com/package/build-plugin-rax-faas)

`build-scripts` plugin for FaaS, the plugin based on Function Compute of Alibaba cloud.

The plugin support following features:

- Integrated development experience, All codes are in the same directory
- The easy way to run devServer in the local
- The easy way to build client code and functions package

## Usage

### Dependencies

build-plugin-rax-faas based on Function Compute of Alibaba cloud, so you need install `docker` and `@alicloud/fun` first:

About docker instructions of installation, you can found in the [docker docs](https://docs.docker.com/install/).

Then install `@alicloud/fun` to your devDependencies:

```bash
$ npm install @alicloud/fun -D
```

And you need install `build-plugin-rax-faas` to your devDependencies:

```bash
$ npm install build-plugin-rax-faas -D
```

## Configure

Add `build-plugin-rax-faas` to `build.json` like:

```json
{
  "plugins": [
    [
      "build-plugin-rax-app",
      {
        "targets": ["web", "weex"]
      }
    ],
    [
      "build-plugin-rax-faas",
      {
        "aliyunConfig": {   // Your function compute config
          "id": "xxxxxxxx",
          "region": "cn-hangzhou"
        },
        "functionGroup": {
          "name": "raxTest",
          "root": "src/api", // The functions dir
          "functions": {
            "user": {
              "path": "user" // The function path relative to root config
            }
          }
        }
      }
    ]
  ]
}
```
