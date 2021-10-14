const path = require('path');
const readPkgUp = require('read-pkg-up');
const { constants } = require('miniapp-builder-shared');
const { MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM } = constants;
const miniappPlatforms = [MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, BAIDU_SMARTPROGRAM, KUAISHOU_MINIPROGRAM];

function normalizePath(file) {
  return path.sep === '\\' ? file.replace(/\\/g, '/') : file;
}

// cache readPkgUp result
const cache = new Map();
function readPkg(filepath) {
  let cached = cache.get(filepath);

  if (!cached) {
    cached = readPkgUp.sync({ cwd: path.dirname(filepath) });
    cache.set(filepath, cached);
  }

  return cached;
}

function isTargetMiniApp(target = '') {
  return miniappPlatforms.includes(target);
}

exports.normalizePath = normalizePath;
exports.readPkg = readPkg;
exports.isTargetMiniApp = isTargetMiniApp;