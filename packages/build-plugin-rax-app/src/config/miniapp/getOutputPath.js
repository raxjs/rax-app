const { ensureDirSync } = require('fs-extra');
const { resolve } = require('path');
const { MINIAPP } = require('../../constants');

module.exports = (context, { target = MINIAPP, distDir = ''}) => {
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;
  const outputPath = distDir ? resolve(rootDir, distDir) : resolve(rootDir, outputDir, target);
  ensureDirSync(outputPath);
  return outputPath;
};
