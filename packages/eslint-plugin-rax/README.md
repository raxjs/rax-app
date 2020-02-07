# eslint-plugin-rax

The ESLint plugins for Rax.

```bash
npm install eslint-plugin-import -g
```

## rules

### rax/no-extraneous-dependencies

Forbid the import of external modules that are not declared in the `package.json`'s `dependencies`, `devDependencies`, `optionalDependencies`, `peerDependencies`, or `bundledDependencies`.
The closest parent `package.json` will be used. If no `package.json` is found, the rule will not lint anything. This behaviour can be changed with the rule option `packageDir`.

The difference between [import/no-extraneous-dependencies](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md), is that modules don't have to be installed for this rule to work.


This rule supports the following options:

`devDependencies`: If set to `false`, then the rule will show an error when `devDependencies` are imported. Defaults to `true`.

`optionalDependencies`: If set to `false`, then the rule will show an error when `optionalDependencies` are imported. Defaults to `true`.

`peerDependencies`: If set to `false`, then the rule will show an error when `peerDependencies` are imported. Defaults to `false`.

`bundledDependencies`: If set to `false`, then the rule will show an error when `bundledDependencies` are imported. Defaults to `true`.

`whitelist`: Whitelisted modules can to be added to skip checking their existence in package.json.

You can set the options like this:

```js
"rax/no-extraneous-dependencies": ["error", {"devDependencies": false, "optionalDependencies": false, "peerDependencies": false}]
```

You can also use an array of globs instead of literal booleans:

```js
"rax/no-extraneous-dependencies": ["error", {"devDependencies": ["**/*.test.js", "**/*.spec.js"]}]
```

You can set the whitelist modules like this:
```js
"rax/no-extraneous-dependencies": ["error", {"devDependencies": ["@components"]}]
```
