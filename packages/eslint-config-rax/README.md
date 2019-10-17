## eslint-config-rax [![npm](https://img.shields.io/npm/v/eslint-config-rax.svg)](https://www.npmjs.com/package/eslint-config-rax)

## Install

```
npm install eslint-config-rax
```

dependencies：
```
  // base dependencies
  "babel-eslint": "^10.0.1"
  "eslint": "^5.16.0"
  "eslint-plugin-import": "^2.17.2"
  // Typescript dependencies
  "@typescript-eslint/eslint-plugin": "^1.7.0"
  "@typescript-eslint/parser": "^1.7.0"
  "typescript": "^3.4.5"
  // React dependencies
  "eslint-plugin-react": "^7.12.4"
```

## Usage

 set `.eslintrc.js` content as：

 * JavaScript project [.eslintrc.js](./test/base/.eslintrc.js)
 * React project [.eslintrc.js](./test/react/.eslintrc.js)
 * Typescript project [.eslintrc.js](./test/typescript/.eslintrc.js)
 * React Typescript project [.eslintrc.js](./test/typescript-react/.eslintrc.js)


## Rules definition

* [base rules](./index.js) Precipitation based on [rax](https://github.com/alibaba/rax) project rules
* [React rules](./react.js) Precipitation based on [rax](https://github.com/alibaba/rax) project rules
* [Typescript rules](./typescript.js) Based on [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules) rules

## Modify rules

If you modify the addition rules, please provide the use and reason of the rules,as:

```javascript
    /**
     * Indent is replaced by two Spaces
     * @reason Conventional convention
    */
    "indent": "off",
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        flatTernaryExpressions: true
      }
    ],
```
