const fs = require('fs-extra');
const path = require('path');
const { MINIAPP } = require('../../constants');

module.exports = (context, { target = MINIAPP, demoClientFolder = false}) => {
  const { rootDir, userConfig, command } = context;
  const { outputDir } = userConfig;
  if (command === 'build') {
    const output = path.resolve(rootDir, outputDir);
    fs.ensureDirSync(output);
    return path.resolve(output, target);
  } else {
    if (demoClientFolder) {
      return path.resolve(rootDir, 'demo', target);
    }
    return path.resolve(rootDir, 'demo', target, 'plugin');
  }
};
