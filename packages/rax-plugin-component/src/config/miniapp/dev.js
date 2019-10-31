const fs = require('fs-extra');
const jsx2mp = require('jsx2mp-cli');
const path = require('path');

module.exports = (context, options, devCompileLog) => {
  const { rootDir } = context;
  const outputPath = path.resolve(rootDir, 'demo/miniapp/components/Target');

  fs.removeSync(outputPath);

  const devOptions = Object.assign({
    entry: 'src/index',
    type: 'component',
    workDirectory: process.cwd(),
    distDirectory: outputPath,
    enableWatch: true,
    platform: 'ali',
    afterCompiled: (err, stats) => {
      devCompileLog({
        err,
        stats,
      });
    },
  }, options);
  jsx2mp.watch(devOptions);
};
