const fs = require('fs-extra');
const { resolve } = require('path');

const { MINIAPP } = require('../../constants');

module.exports = (context, { target = MINIAPP, distDir = '' }) => {
  const { rootDir, userConfig, command } = context;
  const { outputDir } = userConfig;
  if (distDir) {
    return resolve(rootDir, distDir);
  }

  if (command === 'build') {
    const output = resolve(rootDir, outputDir);
    fs.ensureDirSync(output);
    return resolve(output, target);
  } else {
    return resolve(rootDir, 'demo', target, 'components', 'Target');
  }
};
