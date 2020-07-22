const { resolve, dirname, join } = require('path');
const { existsSync, readJSONSync } = require('fs-extra');
const getTagName = require('../utils/getTagName');
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
  'rax-video'
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
      return source;
    }
    const miniappEntry = target === 'miniapp' ? miniappConfig.main : miniappConfig[`main:${target}`];
    // Ensure component has target platform rax complie result
    if (!miniappEntry) {
      return source;
    }
    return join(source, miniappEntry);
  } catch (err) {
    return source;
  }
};

function getTmplPath(source, rootDir, dirName, target) {
  // If it's a npm module, keep source origin value, otherwise use absolute path
  const isNpm = !RELATIVE_COMPONENTS_REG.test(source);
  let filePath = isNpm ? getNpmSourcePath(rootDir, source, target) : resolve(dirName, source);
  const absPath = isNpm ? resolve(rootDir, 'node_modules', filePath) : filePath;
  if (!existsSync(`${absPath}.${extMap[target]}`)) return false;
  if (target === 'wechat-miniprogram') {
    // In Wechat MiniProgram need remove miniprogram_dist
    filePath = filePath.replace('/miniprogram_dist', '');
  }
  return isNpm ? filePath : `.${filePath.replace(resolve(rootDir, 'src'), '')}`;
}

module.exports = function visitor(
  { types: t },
  { usingComponents, target, rootDir }
) {
  // Collect imported dependencies
  const components = {};
  const componentNameMap = new Map();

  const scanedPageMap = {};

  return {
    visitor: {
      ImportDeclaration: {
        enter(path, { filename }) {
          const { specifiers, source } = path.node;
          if (Array.isArray(specifiers) && t.isStringLiteral(source)) {
            const dirName = dirname(filename);
            const filePath = getTmplPath(source.value, rootDir, dirName, target);
            if (filePath) {
              if (!scanedPageMap[filename]) {
                scanedPageMap[filename] = true;
                path.parentPath.traverse({
                  JSXOpeningElement(innerPath) {
                    const { node: innerNode } = innerPath;
                    if (t.isJSXIdentifier(innerNode.name)) {
                      const tagName = innerNode.name.name;
                      if (!components[tagName]) {
                        components[tagName] = {
                          props: [],
                          events: []
                        };
                      }
                      innerNode.attributes.forEach((attrNode) => {
                        if (!t.isJSXIdentifier(attrNode.name)) return;
                        const attrName = attrNode.name.name;
                        if (
                          !components[tagName].props.includes(attrName) &&
                          !components[tagName].events.includes(attrName)
                        ) {
                          // If it starts with 'on', it must be an event handler
                          if (/^on/.test(attrName)) {
                            components[tagName].events.push(attrName.slice(2));
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
                const tagName = specifier.local.name;
                const componentInfo = components[tagName];
                if (componentInfo) {
                  // Generate a random tag name
                  const replacedTagName = /[A-Z]/.test(tagName) ? getTagName(tagName) : tagName;
                  if (!usingComponents[replacedTagName]) {
                    usingComponents[replacedTagName] = { props: [], events: [], children: []};
                  }
                  usingComponents[replacedTagName] = {
                    path: filePath,
                    props: [...new Set(componentInfo.props.concat(usingComponents[replacedTagName].props))],
                    events: [...new Set(componentInfo.events.concat(usingComponents[replacedTagName].events))],
                    children: []
                  };
                  componentNameMap.set(tagName, replacedTagName);
                  // Use const Custom = 'c90589c' replace import Custom from '../public/xxx'
                  path.replaceWith(
                    t.VariableDeclaration('const', [
                      t.VariableDeclarator(
                        t.identifier(tagName),
                        t.stringLiteral(replacedTagName)
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
      JSXOpeningElement: {
        exit(path) {
          const { name } = path.node;
          if (componentNameMap.has(name.name)) {
            const replacedTagName = componentNameMap.get(name.name);
            path.parent.children
              .filter(child => !t.isJSXText(child))
              .forEach((child) => {
                if (t.isJSXElement(child)) {
                  const childOpeningElement = child.openingElement;
                  const childAttributes = childOpeningElement.attributes;
                  const slotAttribute = childAttributes.find(attr => attr.name && attr.name.name === 'slot');
                  const slotInfo = slotAttribute ? { slot: slotAttribute.value.value } : {};
                  usingComponents[replacedTagName].children.push(slotInfo);
                } else {
                  usingComponents[replacedTagName].children.push({});
                }
              }
              );
          }
        }
      },
    },
  };
};
