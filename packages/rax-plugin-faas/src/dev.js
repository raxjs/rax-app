const webpack = require('webpack');
const shell = require('shelljs');
const yaml = require('js-yaml');
const _ = require('lodash');
const fs = require('fs-extra');

const DEFAULT_PORT = '8000';

module.exports = ({ chainWebpack }, functionConfig) => {
  const { functionArr } = functionConfig;

  const devServerUrl = `http://localhost:${DEFAULT_PORT}/2016-08-15/proxy/${functionConfig.name}`;

  chainWebpack((config) => {
    const webConfig = config.getConfig('web');
    webConfig
      .plugin('faasDefinePlugin')
        .use(webpack.DefinePlugin, [{
          __FAAS_API__: JSON.stringify(devServerUrl),
        }]);
  });

  const yamlObj = {
    ROSTemplateFormatVersion: '2015-09-01',
    Transform: 'Aliyun::Serverless-2018-04-03',
    Resources: {
      [functionConfig.name]: {
        Type: 'Aliyun::Serverless::Service',
      },
    },
  }

  functionArr.forEach((fnc) => {
    yamlObj.Resources[functionConfig.name][fnc.name] = {
      Type: 'Aliyun::Serverless::Function',
      Properties: {
        Handler: fnc.handler,
        Runtime: 'nodejs8',
        CodeUri: fnc.path,
      },
      Events: {
        httpTrigger: {
          Type: 'HTTP',
          Properties: {
            AuthType: 'ANONYMOUS',
            Methods: _.clone(fnc.methods), // must be new value
          },
        },
      },
    }
  })

  const templateYaml = yaml.safeDump(yamlObj)

  fs.writeFileSync(`${functionConfig.realRootPath}/template.yml`, templateYaml);
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
