const {
  collectComponentAttr,
  collectUsings,
} = require('../utils/handleComponentAST');

const MINIAPP_PLUGIN_COMPONENTS_REG = /^plugin\:\/\//;

module.exports = function visitor({ types: t }, { usingPlugins }) {
  // Collect imported dependencies
  let pluginComponents = {};
  const scanedFileMap = {};

  return {
    visitor: {
      Program: {
        exit(path, { filename }) {
          scanedFileMap[filename] = false;
          pluginComponents = {};
        },
      },
      ImportDeclaration: {
        enter(path, { filename }) {
          const { source } = path.node;
          if (
            t.isStringLiteral(source) &&
            MINIAPP_PLUGIN_COMPONENTS_REG.test(source.value)
          ) {
            if (!scanedFileMap[filename]) {
              scanedFileMap[filename] = true;
              path.parentPath.traverse({
                JSXOpeningElement: collectComponentAttr(pluginComponents, t),
              });
            }
            collectUsings(
              path,
              pluginComponents,
              usingPlugins,
              source.value,
              t
            );
          }
        },
      },
    },
  };
};
