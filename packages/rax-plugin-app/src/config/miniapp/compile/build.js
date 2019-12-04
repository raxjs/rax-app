const fs = require('fs-extra');
const jsx2mp = require('jsx2mp-cli');

const getOutputPath = require('../getOutputPath');

module.exports = (context, options) => {
  const outputPath = getOutputPath(context, options);
  fs.removeSync(outputPath);

  return new Promise((resolve) => {
    const buildOptions = Object.assign({
      distDirectory: outputPath,
      afterCompiled: (err, stats) => {
        resolve({
          err,
          stats,
        });
      },
    }, options);
    jsx2mp.build(buildOptions);
  });
};
