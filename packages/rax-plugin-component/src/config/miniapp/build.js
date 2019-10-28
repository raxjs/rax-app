const fs = require('fs-extra');
const jsx2mp = require('jsx2mp-cli');

const getOutputPath = require('./getOutputPath');

module.exports = (context, customEntry, options) => {
  const outputPath = getOutputPath(context);

  fs.removeSync(outputPath);

  return new Promise(resolve => {
    const buildOptions = Object.assign({
      entry: customEntry || 'src/index',
      type: 'component',
      workDirectory: process.cwd(),
      distDirectory: outputPath,
      enableWatch: false,
      platform: 'ali',
      afterCompiled: (err, stats) => {
        resolve({
          err,
          stats,
        });
      },
    });
    jsx2mp.build(buildOptions);
  }, options);
};
