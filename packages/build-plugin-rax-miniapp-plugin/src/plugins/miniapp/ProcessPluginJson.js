const { resolve } = require('path');
const { copy, readJSONSync, writeJSON } = require('fs-extra');
const chokidar = require('chokidar');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('../../constants');


/**
 * In Alipay, pages must be an array, while in Wechat pages is an object.
 * So here pages need to be transformed.
 * @param {string} pluginPath
 */
function transformPluginContent(pluginPath) {
  const content = readJSONSync(pluginPath);
  if (content.pages) {
    content.pages = Object.entries(content.pages).map(([pageName, pagePath]) => pagePath);
  }
  return content;
}
/**
 * Process plugin json content and write to dist
 */
module.exports = class ProcessPluginJsonPlugin {
  constructor({ rootDir = '', outputPath = '', target = MINIAPP }) {
    this.rootDir = rootDir;
    this.outputPath = outputPath;
    this.target = target;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'ProcessPluginJsonPlugin',
      (compilation, callback) => {
        const pluginFilePath = resolve(this.rootDir, 'src', 'plugin.json');
        const distPluginFilePath = resolve(this.outputPath, 'plugin.json');
        if (this.target === WECHAT_MINIPROGRAM) {
          copy(pluginFilePath, distPluginFilePath, () => {
            callback();
          });
        } else if (this.target === MINIAPP) {
          const pluginContent = transformPluginContent(pluginFilePath);
          writeJSON(distPluginFilePath, pluginContent, { spaces: 2 }, () => {
            callback();
          });
        }
      }
    );
  }
};
