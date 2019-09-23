const yaml = require('js-yaml');
const _ = require('lodash');
const fs = require('fs-extra');

module.exports = (functionConfig, targetPath) => {
  const { functionArr } = functionConfig;
  const yamlPath = targetPath || functionConfig.realRootPath;

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
  fs.writeFileSync(`${yamlPath}/template.yml`, templateYaml);
};
