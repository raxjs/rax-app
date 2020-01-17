const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

const gulpCompile = require('./gulp/compile');
const gulpParams = require('./gulp/params');

const jsx2mpBuilder = require('./config/miniapp/build');
const { MINIAPP, WECHAT_MINIPROGRAM } = require('./constants');

module.exports = async (api, options = {}) => {
  const { context, log } = api;
  const { rootDir, userConfig, command } = context;
  const { outputDir, devOutputDir } = userConfig;
  const { targets = [] } = options;

  const isDev = command === 'dev';

  const enableTypescript = fs.existsSync(path.join(rootDir, 'tsconfig.json'));
  const buildMiniapp = ~targets.indexOf(MINIAPP);
  const buildWechatMiniProgram = ~targets.indexOf(WECHAT_MINIPROGRAM);

  const BUILD_DIR = path.resolve(rootDir, isDev ? devOutputDir : outputDir);

  log.info('component', chalk.green('Build start... '));

  // set gulpParams
  gulpParams.api = api;
  gulpParams.options = options;

  if (buildMiniapp || buildWechatMiniProgram) {
    if (enableTypescript) {
      gulpParams.compileMiniappTS = true;
      gulpParams.compileAliMiniappTS = buildMiniapp;
      gulpParams.compileWechatMiniProgramTS = buildWechatMiniProgram;
      gulpParams.callback = async () => {
        if (buildMiniapp) {
          const config = options[MINIAPP] || {};
          const result = await jsx2mpBuilder(context, 'src/index', config);
          fs.removeSync(path.join(BUILD_DIR, 'miniappTemp'));
          if (result.err) {
            return result;
          }
        }

        if (buildWechatMiniProgram) {
          const config = Object.assign({
            platform: 'wechat',
          }, options[WECHAT_MINIPROGRAM]);
          const result = await jsx2mpBuilder(context, 'src/index', config);
          fs.removeSync(path.join(BUILD_DIR, 'wechatTemp'));
          if (result.err) {
            return result;
          }
        }
      };
      gulpCompile();
    } else {
      if (buildMiniapp) {
        const config = options[MINIAPP] || {};
        const result = await jsx2mpBuilder(context, null, config);
        if (result.err) {
          return result;
        }
      }
      if (buildWechatMiniProgram) {
        const config = Object.assign({
          platform: 'wechat',
        }, options[WECHAT_MINIPROGRAM]);
        const result = await jsx2mpBuilder(context, null, config);
        if (result.err) {
          return result;
        }
      }
    }
  } else {
    gulpCompile();
  }
};
