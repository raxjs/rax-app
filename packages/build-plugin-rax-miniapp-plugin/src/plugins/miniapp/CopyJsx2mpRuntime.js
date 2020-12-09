const { join } = require('path');
const { copySync, existsSync, writeFileSync, readJSONSync, readFileSync } = require('fs-extra');
const { minify } = require('terser');

/**
 *  Runtime packages should be a dependency of build-plugin-rax-app. But if the project has installed it, then it will take the priority.
 * @param {string} packageName
 * @param {string} rootDir
 */
function getHighestPriorityPackageJSON(packageName, rootDir) {
  const targetFile = join(packageName, 'package.json');
  const resolvePaths = require.resolve.paths(targetFile);
  resolvePaths.unshift(join(rootDir, 'node_modules'));
  const packageJSONPath = require.resolve(targetFile, {
    paths: resolvePaths
  });
  return packageJSONPath;
}

const runtime = 'jsx2mp-runtime';
let runtimePackageJSONPath = null;
let runtimePackageJSON = null;
let runtimePackagePath = null;

/**
 * For convenient to copy vendors.
 */
module.exports = class JSX2MPRuntimePlugin {
  constructor({ platform = 'ali', mode = 'build', rootDir = '', outputPath = '' }) {
    this.platform = platform;
    this.mode = mode;
    this.rootDir = rootDir;
    this.outputPath = outputPath;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'JSX2MPRuntimePlugin',
      (compilation, callback) => {
        if (!runtimePackageJSONPath) {
          runtimePackageJSONPath = getHighestPriorityPackageJSON(runtime, this.rootDir);
          runtimePackageJSON = readJSONSync(runtimePackageJSONPath);
          runtimePackagePath = join(runtimePackageJSONPath, '..');
        }
        const runtimeTargetPath = `dist/jsx2mp-runtime.${this.platform}.esm.js`;
        const sourceFile = require.resolve(join(runtimePackagePath, runtimeTargetPath));
        const targetFile = join(this.outputPath, 'npm', runtime + '.js');

        if (this.mode === 'build') {
          const sourceCode = minify(readFileSync(sourceFile, 'utf-8')).code;
          writeFileSync(targetFile, sourceCode);
        } else {
          if (!existsSync(targetFile)) {
            copySync(sourceFile, targetFile);
          }
        }

        callback();
      }
    );
  }
};
