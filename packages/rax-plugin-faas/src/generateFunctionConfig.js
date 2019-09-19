const path = require('path');
const _ = require('lodash');

const defaultFncConfig = {
  trigger: 'http',
  handler: 'index.handler',
  methods: ['GET'],
}
/**
 * result {
 *    ...functionGroup
 *    realRootPath: string
 *    functionArr: [{
 *        name: string
 *        path: string
 *        realPath: string
 *        trigger: string
 *        handler: string
 *        methods: array(string)
 *    }]
 * }
 */

module.exports = (context, options) => {
  const { rootDir } = context;
  const { functionGroup } = options;

  const realRootPath = path.resolve(rootDir, functionGroup.root);

  const functionArr = [];
  for (const [key, value] of Object.entries(functionGroup.functions)) {
    let customConfig = {
      name: key,
    };

    // string represent function path
    if (_.isString(value)) {
      customConfig.path = value
    }

    if (_.isObject(value)) {
      customConfig = Object.assign(customConfig, value);
    }

    const func = Object.assign({}, defaultFncConfig, customConfig);
    const [ handlerFile, handlerFunc ] = func.handler.split('.');
    func.handlerFile = handlerFile;
    func.handlerFunc = handlerFunc;
    func.realPath = path.resolve(realRootPath, func.path);
    functionArr.push(func);
  }

  const result = {
    ...functionGroup,
    realRootPath,
    functionArr,
  }

  return result;
}
