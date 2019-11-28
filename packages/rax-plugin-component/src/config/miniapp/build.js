const fs = require('fs-extra');
const jsx2mp = require('jsx2mp-cli');

const getOutputPath = require('./getOutputPath');

module.exports = (context, customEntry, options) => {
  const outputPath = getOutputPath(context, options);

  fs.removeSync(outputPath);

  return new Promise(resolve => {
    const buildOptions = Object.assign({
      entry: customEntry || 'src/index',
      type: 'component',
      workDirectory: process.cwd(),
      distDirectory: outputPath,
      enableWatch: false,
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
