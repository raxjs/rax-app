const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

const gulpCompile = require('./gulp/compile');
const gulpParams = require('./gulp/params');

const mpBuild = require('./config/miniapp/build');

module.exports = async(api, options = {}) => {
  const { context, log } = api;
  const { rootDir, userConfig, command } = context;
  const { outputDir, devOutputDir } = userConfig;
  const { targets = [], miniapp = {} } = options;

  const isDev = command === 'dev';

  const enableTypescript = fs.existsSync(path.join(rootDir, 'tsconfig.json'));
  const buildMiniapp = ~targets.indexOf('miniapp');

  const BUILD_DIR = path.resolve(rootDir, isDev ? devOutputDir : outputDir);

  log.info('component', chalk.green('Build start... '));

  // set gulpParams
  gulpParams.api = api;
  gulpParams.options = options;

  gulpCompile();

  if (buildMiniapp) {
    if (enableTypescript) {
      gulpParams.compileMiniappTS = true;
      gulpParams.callback = async() => {
        const mpErr = await mpBuild(context, 'lib/miniappTemp/index', miniapp);
        fs.removeSync(path.join(BUILD_DIR, 'miniappTemp'));

        return mpErr;

      };
      gulpCompile();
    } else {
      const mpErr = await mpBuild(context, null, miniapp);

      if (mpErr) {
        return mpErr;
      }
    }
  }
};
