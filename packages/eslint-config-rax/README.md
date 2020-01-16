## eslint-config-rax [![npm](https://img.shields.io/npm/v/eslint-config-rax.svg)](https://www.npmjs.com/package/eslint-config-rax)

## Usage

Shareable configs are designed to work with the `extends` feature of `.eslintrc` files.
You can learn more about
[Shareable Configs](http://eslint.org/docs/developer-guide/shareable-configs) on the
official ESLint website.

Run the following command:

```bash
npm install --save-dev eslint eslint-config-rax babel-eslint eslint-plugin-react eslint-plugin-import
```

Then, add this to your `.eslintrc.js` file:

```js
// .eslintrc.js
module.exports = {
  extends: ['rax']
};
```

*Note: We omitted the `eslint-config-` prefix since it is automatically assumed by ESLint.*

If you use TypeScript, run the following command:

```bash
npm install --save-dev eslint eslint-config-rax babel-eslint eslint-plugin-react eslint-plugin-import @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Then, add this to your `.eslintrc.js` file:

```js
// .eslintrc.js
module.exports = {
  extends: ['rax/typescript']
};
```

Make sure you read about [the `--ext` command line option](https://eslint.org/docs/user-guide/command-line-interface#--ext). Example command line usage:

```
npx eslint --ext .js,.ts .
```