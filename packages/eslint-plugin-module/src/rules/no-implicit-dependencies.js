/**
 * Disallows importing modules that are not listed as dependency in the project’s package.json
 * This rule is inspired by:
 * import/no-extraneous-dependencies: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
 * TSLint rule no-implicit-dependencies: https://palantir.github.io/tslint/rules/no-implicit-dependencies/
 */
const path = require('path');
const fs = require('fs');
const builtins = require('builtin-modules');
const readPkgUp = require('read-pkg-up');
const minimatch = require('minimatch');

function isStaticRequire(node) {
  return node &&
    node.callee &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal' &&
    typeof node.arguments[0].value === 'string';
}

function hasKeys(obj = {}) {
  return Object.keys(obj).length > 0;
}

function arrayOrKeys(arrayOrObject) {
  return Array.isArray(arrayOrObject) ? arrayOrObject : Object.keys(arrayOrObject);
}

function extractDepFields(pkg = {}) {
  return {
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {},
    optionalDependencies: pkg.optionalDependencies || {},
    peerDependencies: pkg.peerDependencies || {},
    // BundledDeps should be in the form of an array, but object notation is also supported by
    // `npm`, so we convert it to an array if it is an object
    bundledDependencies: arrayOrKeys(pkg.bundleDependencies || pkg.bundledDependencies || []),
  };
}

function getDependencies(context, packageDir) {
  let paths = [];
  try {
    const packageContent = {
      dependencies: {},
      devDependencies: {},
      optionalDependencies: {},
      peerDependencies: {},
      bundledDependencies: [],
    };

    if (packageDir && packageDir.length > 0) {
      if (!Array.isArray(packageDir)) {
        paths = [path.resolve(packageDir)];
      } else {
        paths = packageDir.map(dir => path.resolve(dir));
      }
    }

    if (paths.length > 0) {
      // use rule config to find package.json
      paths.forEach(dir => {
        const _packageContent = extractDepFields(
          JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
        );
        Object.keys(packageContent).forEach(depsKey =>
          Object.assign(packageContent[depsKey], _packageContent[depsKey])
        );
      });
    } else {
      // use closest package.json
      Object.assign(
        packageContent,
        extractDepFields(
          readPkgUp.sync({cwd: context.getFilename(), normalize: false}).packageJson
        )
      );
    }

    if (![
      packageContent.dependencies,
      packageContent.devDependencies,
      packageContent.optionalDependencies,
      packageContent.peerDependencies,
      packageContent.bundledDependencies,
    ].some(hasKeys)) {
      return null;
    }

    return packageContent;
  } catch (e) {
    if (paths.length > 0 && e.code === 'ENOENT') {
      context.report({
        message: 'The package.json file could not be found.',
        loc: { line: 0, column: 0 },
      });
    }
    if (e.name === 'JSONError' || e instanceof SyntaxError) {
      context.report({
        message: 'The package.json file could not be parsed: ' + e.message,
        loc: { line: 0, column: 0 },
      });
    }

    return null;
  }
}

function missingErrorMessage(packageName) {
  return `'${packageName}' should be listed in the project's dependencies. ` +
    `Run 'npm i -S ${packageName}' to add it`;
}

function devDepErrorMessage(packageName) {
  return `'${packageName}' should be listed in the project's dependencies, not devDependencies.`;
}

function optDepErrorMessage(packageName) {
  return `'${packageName}' should be listed in the project's dependencies, ` +
    'not optionalDependencies.';
}

function reportIfMissing(context, deps, depsOptions, node, name) {
  // Do not report when importing types
  if (node.importKind === 'type') {
    return;
  }

  if (pathIsRelative(name)) {
    return;
  }

  const options = context.options[0] || {};
  const whitelist = options.whitelist || [];
  const packageName = getPackageName(name, whitelist);

  if (whitelist.includes(packageName)) {
    return;
  }

  if (builtins.includes(packageName)) {
    return;
  }

  const isInDeps = deps.dependencies[packageName] !== undefined;
  const isInDevDeps = deps.devDependencies[packageName] !== undefined;
  const isInOptDeps = deps.optionalDependencies[packageName] !== undefined;
  const isInPeerDeps = deps.peerDependencies[packageName] !== undefined;
  const isInBundledDeps = deps.bundledDependencies.indexOf(packageName) !== -1;

  if (isInDeps ||
    depsOptions.allowDevDeps && isInDevDeps ||
    depsOptions.allowPeerDeps && isInPeerDeps ||
    depsOptions.allowOptDeps && isInOptDeps ||
    depsOptions.allowBundledDeps && isInBundledDeps
  ) {
    return;
  }

  if (isInDevDeps && !depsOptions.allowDevDeps) {
    context.report(node, devDepErrorMessage(packageName));
    return;
  }

  if (isInOptDeps && !depsOptions.allowOptDeps) {
    context.report(node, optDepErrorMessage(packageName));
    return;
  }

  context.report(node, missingErrorMessage(packageName));
}

function getPackageName(name, whitelist) {
  var parts = name.split(/\//g);
  if (name[0] !== '@' || whitelist.includes(parts[0])) {
    return parts[0];
  }
  if (whitelist.includes(name)) {
    return name;
  }
  return parts[0] + '/' + parts[1];
}

function testConfig(config, filename) {
  // Simplest configuration first, either a boolean or nothing.
  if (typeof config === 'boolean' || typeof config === 'undefined') {
    return config;
  }
  // Array of globs.
  return config.some(c =>
    minimatch(filename, c) ||
    minimatch(filename, path.join(process.cwd(), c))
  );
}

/**
 * Determines whether a path starts with a relative path component (i.e. `.` or `..`).
 */
function pathIsRelative(path) {
  return /^\.\.?($|[\\/])/.test(path);
}

module.exports = {
  meta: {
    type: 'problem',
    schema: [
      {
        'type': 'object',
        'properties': {
          'devDependencies': { 'type': ['boolean', 'array'] },
          'optionalDependencies': { 'type': ['boolean', 'array'] },
          'peerDependencies': { 'type': ['boolean', 'array'] },
          'bundledDependencies': { 'type': ['boolean', 'array'] },
          'packageDir': { 'type': ['string', 'array'] },
          'whitelist': {'type': 'array'}
        },
        'additionalProperties': false,
      },
    ],
  },

  create: function(context) {
    const options = context.options[0] || {};
    const filename = context.getFilename();
    const deps = getDependencies(context, options.packageDir) || extractDepFields({});

    const depsOptions = {
      allowDevDeps: testConfig(options.devDependencies, filename) !== false,
      allowOptDeps: testConfig(options.optionalDependencies, filename) !== false,
      allowPeerDeps: testConfig(options.peerDependencies, filename) !== false,
      allowBundledDeps: testConfig(options.bundledDependencies, filename) !== false,
    };

    return {
      ImportDeclaration: function(node) {
        if (node.source) {
          reportIfMissing(context, deps, depsOptions, node, node.source.value);
        }
      },
      ExportNamedDeclaration: function(node) {
        if (node.source) {
          reportIfMissing(context, deps, depsOptions, node, node.source.value);
        }
      },
      ExportAllDeclaration: function(node) {
        if (node.source) {
          reportIfMissing(context, deps, depsOptions, node, node.source.value);
        }
      },
      CallExpression: function handleRequires(node) {
        if (isStaticRequire(node)) {
          reportIfMissing(context, deps, depsOptions, node, node.arguments[0].value);
        }
      },
    };
  },
};
