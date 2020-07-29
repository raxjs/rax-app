const { collectComponentAttr, collectUsings, scanSlot } = require('../utils/handleComponentAST');
const MINIAPP_PLUGIN_COMPONENTS_REG = /^plugin\:\/\//;

module.exports = function visitor(
  { types: t },
  { usingPlugins }
) {
  // Collect imported dependencies
  const pluginComponents = {};
  const pluginComponentsNameMap = new Map();
  const scanedFileMap = {};

  return {
    visitor: {
      ImportDeclaration: {
        enter(path, { filename }) {
          const { source } = path.node;
          if (t.isStringLiteral(source) && MINIAPP_PLUGIN_COMPONENTS_REG.test(source.value)) {
            if (!scanedFileMap[filename]) {
              scanedFileMap[filename] = true;
              path.parentPath.traverse({
                JSXOpeningElement: collectComponentAttr(pluginComponents, t)
              });
            }
            collectUsings(path, pluginComponents, pluginComponentsNameMap, usingPlugins, source.value, t);
          }
        },
      },
      JSXOpeningElement: {
        exit: scanSlot(pluginComponentsNameMap, usingPlugins, t)
      },
    },
  };
};
