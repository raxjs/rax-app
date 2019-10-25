const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');

const generateYaml = require('./generateYaml');
const funcBuilder = require('./funcBuilder');

module.exports = (api, functionConfig, options) => {
  const { chainWebpack, context, onHook } = api;
  const { rootDir, userConfig } = context;
  const { outputDir } = userConfig;
  const { aliyunConfig } = options;

  const devServerUrl = `//${aliyunConfig.id}.${aliyunConfig.region}.fc.aliyuncs.com/2016-08-15/proxy/${functionConfig.name}`;

  chainWebpack((config) => {
    const webConfig = config.getConfig('web');
    webConfig
      .plugin('faasDefinePlugin')
        .use(webpack.DefinePlugin, [{
          __FAAS_API__: JSON.stringify(devServerUrl),
        }]);
  });

  onHook('after.build', () => {
    const faasPath = path.resolve(rootDir, outputDir, 'api');
    fs.ensureDirSync(faasPath);
    generateYaml(functionConfig, faasPath);
    funcBuilder(api, functionConfig);
  });
};
