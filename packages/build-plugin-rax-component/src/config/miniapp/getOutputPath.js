const { resolve } = require('path');
const { getOutputPath } = require('miniapp-builder-shared');

const { MINIAPP } = require('../../constants');

module.exports = (context, { target = MINIAPP, distDir = '' }) => {
  const { rootDir, command } = context;
  if (distDir) {
    return resolve(rootDir, distDir);
  }

  if (command === 'build') {
    getOutputPath(context, target, distDir);
  } else {
    return resolve(rootDir, 'demo', target, 'components', 'Target');
  }
};
