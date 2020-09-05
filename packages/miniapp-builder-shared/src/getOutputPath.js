const fs = require('fs-extra');
const path = require('path');

module.exports = (context, target) => {
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;

  const output = path.resolve(rootDir, outputDir);
  fs.ensureDirSync(output);
  return path.resolve(output, target);
};
