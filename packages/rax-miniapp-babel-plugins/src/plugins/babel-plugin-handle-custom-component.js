const { relative, resolve, dirname } = require('path');
const { existsSync } = require('fs-extra');
const extMap = require('../utils/extMap');

const RELATIVE_COMPONENTS_REG = /^\./;

function getTmplPath(source, rootDir, dirName, ext) {
  // If it's a npm module, keep source origin value, otherwise use absolute path
  const isNpm = !RELATIVE_COMPONENTS_REG.test(source);
  const filePath = isNpm ? resolve(rootDir, 'node_modules', source) : resolve(dirName, source);
  if (!existsSync(`${filePath}.${ext}`)) return false;
  return isNpm ? source : `..${filePath.replace(resolve(rootDir, 'src'), '')}`;
}

module.exports = function visitor(
  { types: t },
  { usingComponents, target, rootDir }
) {
  // Collect imported dependencies
  const components = {};

  return {
    visitor: {
      ImportDeclaration: {
        exit(path, { filename }) {
          const { specifiers, source } = path.node;
          if (Array.isArray(specifiers) && t.isStringLiteral(source)) {
            const dirName = dirname(filename);
            const filePath = getTmplPath(source.value, rootDir, dirName, extMap[target]);
            if (filePath) {
              if (!Object.keys(components).length) {
                path.parentPath.traverse({
                  JSXOpeningElement(innerPath) {
                    const { node } = innerPath;
                    if (t.isJSXIdentifier(node.name)) {
                      const tagName = node.name.name.toLowerCase();
                      node.name.name = tagName;
                      if (!components[tagName]) {
                        components[tagName] = {
                          props: [],
                          events: [],
                        };
                      }
                      node.attributes.forEach((attrNode) => {
                        if (!t.isJSXIdentifier(attrNode.name)) return;
                        const attrName = attrNode.name.name;
                        if (
                          !components[tagName].props.includes(attrName) &&
                          !components[tagName].events.includes(attrName)
                        ) {
                          // If it starts with 'on', it must be an event handler
                          if (/^on/.test(attrName)) {
                            components[tagName].events.push(attrName);
                          } else {
                            components[tagName].props.push(attrName);
                          }
                        }
                      });
                    }
                  },
                });
              }
              for (let specifier of specifiers) {
                const tagName = specifier.local.name.toLowerCase();
                const componentInfo = components[tagName];
                if (componentInfo) {
                  usingComponents[tagName] = {
                    path: filePath,
                    ...componentInfo,
                  };
                  // Use const Custom = 'custom' replace import Custom from '../public/xxx'
                  path.replaceWith(
                    t.VariableDeclaration('const', [
                      t.VariableDeclarator(
                        t.identifier(specifier.local.name),
                        t.stringLiteral(tagName)
                      ),
                    ])
                  );
                  break;
                }
              }
            }
          }
        },
      },

    },
  };
};
