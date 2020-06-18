const { resolve, dirname, join } = require('path');
const { existsSync, readJSONSync } = require('fs-extra');
const md5 = require('md5');
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

function getTagName(str) {
  return 'c' + md5(str).slice(0, 6);
}

function getTmplPath(source, rootDir, dirName, target) {
  // If it's a npm module, keep source origin value, otherwise use absolute path
  const isNpm = !RELATIVE_COMPONENTS_REG.test(source);
  let filePath = isNpm ? getNpmSourcePath(rootDir, source, target) : resolve(dirName, source);
  const absPath = isNpm ? resolve(rootDir, 'node_modules', filePath) : filePath;
  if (!existsSync(`${absPath}.${extMap[target]}`)) return false;
  if (target === 'wechat-miniprogram') {
    filePath = filePath.replace('/miniprogram_dist');
  }
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
                  usingComponents[replacedTagName] = {
                    path: filePath,
                    props: componentInfo.props,
                    events: componentInfo.events
                  };
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

    },
  };
};
