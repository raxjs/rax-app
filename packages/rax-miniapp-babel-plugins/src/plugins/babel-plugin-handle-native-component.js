const { resolve, dirname, join } = require('path');
const { existsSync, readJSONSync } = require('fs-extra');
const extMap = require('../utils/extMap');
const { collectComponentAttr, collectUsings } = require('../utils/handleComponentAST');

const { WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, QUICKAPP } = require('../constants');

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

const targetMap = {
  [WECHAT_MINIPROGRAM]: 'wechat',
  [BYTEDANCE_MICROAPP]: 'bytedance',
  [QUICKAPP]: 'quickapp'
};

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
    const miniappEntry = target === 'miniapp' ? miniappConfig.main : miniappConfig[`main:${targetMap[target]}`];
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
  const nativeComponents = {};
  const nativeComponentsNameMap = new Map();

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
                  JSXOpeningElement: collectComponentAttr(nativeComponents, t)
                });
              }
              collectUsings(path, nativeComponents, nativeComponentsNameMap, usingComponents, filePath, t);
            }
          }
        },
      }
    },
  };
};
