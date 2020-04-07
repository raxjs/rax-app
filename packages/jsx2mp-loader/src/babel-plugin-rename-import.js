const { join, relative, dirname } = require('path');
const enhancedResolve = require('enhanced-resolve');
const chalk = require('chalk');

const { QUICKAPP } = require('./constants');
const { isNpmModule, isWeexModule, isQuickAppModule, isRaxModule, isJsx2mpRuntimeModule, isNodeNativeModule } = require('./utils/judgeModule');
const { addRelativePathPrefix, normalizeOutputFilePath, removeExt } = require('./utils/pathHelper');
const getAliasCorrespondingValue = require('./utils/getAliasCorrespondingValue');

const RUNTIME = 'jsx2mp-runtime';

const getRuntimeByPlatform = (platform) => `${RUNTIME}/dist/jsx2mp-runtime.${platform}.esm`;

const getRuntimeRelativePath = (distSourcePath, outputPath) => addRelativePathPrefix(normalizeOutputFilePath(join(relative(dirname(distSourcePath), join(outputPath, 'npm')), RUNTIME)));

const defaultOptions = {
  normalizeNpmFileName: (s) => s,
};

const transformPathMap = {};

const resolveWithTS = enhancedResolve.create.sync({
  extensions: ['.ts', '.js']
});

module.exports = function visitor({ types: t }, options) {
  options = Object.assign({}, defaultOptions, options);
  const { normalizeNpmFileName, distSourcePath, resourcePath, outputPath, disableCopyNpm, platform, aliasEntries } = options;
  const source = (value, rootContext) => {
    // Example:
    // value => '@ali/universal-goldlog' or '@ali/xxx/foo/lib'
    // filename => '/Users/xxx/workspace/yyy/src/utils/logger.js'
    // rootContext => '/Users/xxx/workspace/yyy/'

    const target = enhancedResolve.sync(resourcePath, value);

    const rootNodeModulePath = join(rootContext, 'node_modules');
    const filePath = relative(dirname(distSourcePath), join(outputPath, 'npm', relative(rootNodeModulePath, target)));
    return t.stringLiteral(normalizeNpmFileName(addRelativePathPrefix(normalizeOutputFilePath(filePath))));
  };

  // In WeChat MiniProgram, `require` can't get index file if index is omitted
  const ensureIndexInPath = (value, resourcePath) => {
    const target = resolveWithTS(dirname(resourcePath), value);
    const result = relative(dirname(resourcePath), target);
    return removeExt(addRelativePathPrefix(normalizeOutputFilePath(result)));
  };

  return {
    visitor: {
      ImportDeclaration(path, state) {
        let { value } = path.node.source;
        // Handle alias
        const aliasCorrespondingValue = getAliasCorrespondingValue(aliasEntries, value, resourcePath);
        if (aliasCorrespondingValue) {
          path.node.source = t.stringLiteral(aliasCorrespondingValue);
          value = path.node.source.value;
        }

        if (isNpmModule(value)) {
          if (isWeexModule(value)) {
            path.remove();
            return;
          }
          if (isQuickAppModule(value)) {
            if (platform.type === QUICKAPP) {
              path.skip();
            } else {
              path.remove();
            }
            return;
          }
          if (isNodeNativeModule(value)) {
            path.skip();
            return;
          }

          if (isRaxModule(value)) {
            const runtimePath = disableCopyNpm ? getRuntimeByPlatform(platform.type) : getRuntimeRelativePath(distSourcePath, outputPath);
            path.node.source = t.stringLiteral(runtimePath);
            transformPathMap[runtimePath] = true;
            return;
          }

          if (isJsx2mpRuntimeModule(value)) {
            const runtimePath = disableCopyNpm ? value : getRuntimeRelativePath(distSourcePath, outputPath);
            path.node.source = t.stringLiteral(runtimePath);
            transformPathMap[runtimePath] = true;
            return;
          }

          if (!disableCopyNpm) {
            const processedSource = source(value, state.cwd);
            // Add lock to avoid repeatly transformed in CallExpression if @babel/preset-env invoked
            transformPathMap[processedSource.value] = true;
            path.node.source = processedSource;
          }
        } else {
          const ensuredPath = ensureIndexInPath(value, resourcePath);
          path.node.source = t.stringLiteral(ensuredPath);
        }
      },

      CallExpression(path, state) {
        const { node } = path;
        if (
          node.callee.name === 'require' &&
          node.arguments &&
          node.arguments.length === 1
        ) {
          if (t.isStringLiteral(node.arguments[0])) {
            let moduleName = node.arguments[0].value;
            // Handle alias
            const aliasCorrespondingValue = getAliasCorrespondingValue(aliasEntries, moduleName, resourcePath);
            if (aliasCorrespondingValue) {
              path.node.arguments = [
                t.stringLiteral(aliasCorrespondingValue)
              ];
              moduleName = node.arguments[0].value;
            }
            if (isNpmModule(moduleName)) {
              if (isWeexModule(moduleName)) {
                path.replaceWith(t.nullLiteral());
                return;
              }
              if (isQuickAppModule(moduleName)) {
                if (platform.type === QUICKAPP) {
                  path.skip();
                } else {
                  path.replaceWith(t.nullLiteral());
                }
                return;
              }
              if (isNodeNativeModule(moduleName)) {
                path.skip();
                return;
              }

              if (isRaxModule(moduleName)) {
                const runtimePath = disableCopyNpm ? getRuntimeByPlatform(platform.type) : getRuntimeRelativePath(distSourcePath, outputPath);
                path.node.arguments = [
                  t.stringLiteral(runtimePath)
                ];
                return;
              }

              if (isJsx2mpRuntimeModule(moduleName)) {
                const runtimePath = disableCopyNpm ? moduleName : getRuntimeRelativePath(distSourcePath, outputPath);
                path.node.arguments = [
                  t.stringLiteral(runtimePath)
                ];
                return;
              }

              if (!disableCopyNpm) {
                const processedSource = source(moduleName, state.cwd);
                transformPathMap[processedSource.value] = true;
                path.node.arguments = [ processedSource ];
              }
            } else {
              if (!transformPathMap[moduleName]) {
                path.node.arguments = [
                  t.stringLiteral(ensureIndexInPath(moduleName, resourcePath))
                ];
              }
            }
          } else if (t.isExpression(node.arguments[0])) {
            // require with expression, can not staticly find target.
            console.warn(chalk.yellow(`Critical requirement of "${path.toString()}", which have been removed at \n${state.filename}.`));
            path.replaceWith(t.nullLiteral());
          }
        }
      }
    }
  };
};
