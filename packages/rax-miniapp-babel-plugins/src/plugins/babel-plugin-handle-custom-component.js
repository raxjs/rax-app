const { resolve, dirname, join } = require('path');
const { existsSync, readJSONSync } = require('fs-extra');
const extMap = require('../utils/extMap');

const RELATIVE_COMPONENTS_REG = /^\./;

const baseComponents = [
  'rax-view',
  'rax-canvas',
  'rax-icon',
  'rax-image',
  'rax-picture',
  'rax-text',
  'rax-link',
  'rax-scrollview',
  'rax-recyclerview',
  'rax-slider',
  'rax-textinput',
];

/**
 * Get native component npm path
 * @param {string} rootDir project root dir
 * @param {string} source module name
 * @param {string} target miniapp platform
 */
function getNpmSourcePath(rootDir, source, target) {
  const modulePath = resolve(rootDir, 'node_modules', source);
  try {
    const pkgConfig = readJSONSync(join(modulePath, 'package.json'));
    const miniappConfig = pkgConfig.miniappConfig;
    if (!miniappConfig || baseComponents.includes(source)) {
      return modulePath;
    }
    const miniappEntry = target === 'miniapp' ? miniappConfig.main : miniappConfig[`main:${target}`];
    // Ensure component has target platform rax complie result
    if (!miniappEntry) {
      return modulePath;
    }
    return join(source, miniappEntry);
  } catch (err) {
    return modulePath;
  }
};

function getTmplPath(source, rootDir, dirName, target) {
  // If it's a npm module, keep source origin value, otherwise use absolute path
  const isNpm = !RELATIVE_COMPONENTS_REG.test(source);
  const filePath = isNpm ? getNpmSourcePath(rootDir, source, target) : resolve(dirName, source);
  const absPath = isNpm ? resolve(rootDir, 'node_modules', filePath) : filePath;
  if (!existsSync(`${absPath}.${extMap[target]}`)) return false;
  return isNpm ? filePath : `..${filePath.replace(resolve(rootDir, 'src'), '')}`;
}

module.exports = function visitor(
  { types: t },
  { usingComponents, target, rootDir }
) {
  // Collect imported dependencies
  const components = {};
  const scanedPageMap = {};

  return {
    visitor: {
      ImportDeclaration: {
        exit(path, { filename }) {
          const { specifiers, source } = path.node;
          if (Array.isArray(specifiers) && t.isStringLiteral(source)) {
            const dirName = dirname(filename);
            const filePath = getTmplPath(source.value, rootDir, dirName, target);
            if (filePath) {
              if (!scanedPageMap[filename]) {
                scanedPageMap[filename] = true;
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
