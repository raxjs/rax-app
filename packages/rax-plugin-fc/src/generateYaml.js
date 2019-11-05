const yaml = require('js-yaml');
const fs = require('fs-extra');

module.exports = (functionConfig, targetPath) => {
  const { functionArr, runtime } = functionConfig;
  const yamlPath = targetPath || functionConfig.realRootPath;

  const yamlObj = {
    // https://github.com/ninghao/aliyun-ros#rostemplateformatversion%E5%BF%85%E9%9C%80
    ROSTemplateFormatVersion: '2015-09-01',
    // https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md
    Transform: 'Aliyun::Serverless-2018-04-03',
    Resources: {
      [functionConfig.name]: {
        Type: 'Aliyun::Serverless::Service',
      },
    },
  };

  functionArr.forEach((fnc) => {
    yamlObj.Resources[functionConfig.name][fnc.name] = {
      Type: 'Aliyun::Serverless::Function',
      Properties: {
        Handler: fnc.handler,
        Runtime: runtime || 'nodejs8',
        CodeUri: fnc.path,
      },
      Events: {
        httpTrigger: {
          Type: 'HTTP',
          Properties: {
            AuthType: 'ANONYMOUS',
            Methods: fnc.methods,
          },
        },
      },
    };
  });

  const templateYaml = yaml.safeDump(yamlObj);
  fs.writeFileSync(`${yamlPath}/template.yml`, templateYaml);
};
