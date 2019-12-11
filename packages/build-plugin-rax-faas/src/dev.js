const webpack = require('webpack');
const shell = require('shelljs');

const generateYaml = require('./generateYaml');

const DEFAULT_PORT = '8000';

module.exports = ({ onGetWebpackConfig }, functionConfig) => {
  const devServerUrl = `//localhost:${DEFAULT_PORT}/2016-08-15/proxy/${functionConfig.name}`;

  onGetWebpackConfig('web', (config) => {
    config
      .plugin('faasDefinePlugin')
        .use(webpack.DefinePlugin, [{
          __FAAS_API__: JSON.stringify(devServerUrl),
        }]);
  });

  generateYaml(functionConfig);

  runCommand(`cd ${functionConfig.realRootPath} && fun local start`);
};

// rerun command when error
function runCommand(cmdStr) {
  shell.exec(cmdStr, { async: true }, (error) => {
    if (error) {
      runCommand(cmdStr);
    }
  });
}
