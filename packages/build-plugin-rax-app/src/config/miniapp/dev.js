const fs = require('fs-extra');
const jsx2mp = require('jsx2mp-cli');

const getOutputPath = require('./getOutputPath');

module.exports = (context, options, devCompileLog) => {
  const outputPath = getOutputPath(context, options);
  fs.removeSync(outputPath);

  const devOptions = Object.assign({
    distDirectory: outputPath,
    afterCompiled: (err, stats) => {
      devCompileLog({
        err,
        stats,
      });
    },
  }, options);
  jsx2mp.watch(devOptions);
};
