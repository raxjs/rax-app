const { join } = require('path');

const safeWriteFile = require('./safeWriteFile');
const { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, QUICKAPP } = require('./constants');

const fileNameMap = {
  [MINIAPP]: 'mini.project.json',
  [WECHAT_MINIPROGRAM]: 'project.config.json',
  [BYTEDANCE_MICROAPP]: 'project.config.json'
};

module.exports = function(outputPath, nativeConfig, target) {
  if (nativeConfig && fileNameMap[target]) {
    safeWriteFile(join(outputPath, fileNameMap[target]), nativeConfig, true);
  }
};
