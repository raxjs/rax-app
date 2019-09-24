const webpack = require('webpack');
const shell = require('shelljs');

const generateYaml = require('./generateYaml');

const DEFAULT_PORT = '8000';

module.exports = ({ chainWebpack }, functionConfig) => {
  const devServerUrl = `//localhost:${DEFAULT_PORT}/2016-08-15/proxy/${functionConfig.name}`;

  chainWebpack((config) => {
    const webConfig = config.getConfig('web');
    webConfig
      .plugin('faasDefinePlugin')
        .use(webpack.DefinePlugin, [{
          __FAAS_API__: JSON.stringify(devServerUrl),
        }]);
  });

  generateYaml(functionConfig);

  runCommand(`cd ${functionConfig.realRootPath} && npx fun local start`);
};

// rerun command when error
function runCommand(cmdStr) {
  shell.exec(cmdStr, { async: true }, (error) => {
    if (error) {
      runCommand(cmdStr);
    }
  });
}
