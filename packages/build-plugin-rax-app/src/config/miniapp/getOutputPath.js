const fs = require('fs-extra');
const path = require('path');

module.exports = (context, options = {}) => {
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;
  const output = path.resolve(rootDir, outputDir);
  fs.ensureDirSync(output);
  const platform = options.platform;
  switch(platform) {
    case 'wechat':
      return path.resolve(output, 'wechat-miniprogram');
    case 'ali':
    default:
      return path.resolve(output, 'miniapp');
  }
};
