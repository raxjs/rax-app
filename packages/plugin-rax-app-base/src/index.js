const path = require('path');
const { getJestConfig } = require('build-scripts-config');
const debug = require('debug')('rax-app');
const registerCliOption = require('./registerCliOption');
const registerUserConfig = require('./registerUserConfig');
const modifyUserConfig = require('./modifyUserConfig');
const getBase = require('./base');

module.exports = (api) => {
  const { onGetJestConfig, onGetWebpackConfig, context, onHook, setValue } = api;
  const { command, rootDir } = context;

  setValue('GET_WEBPACK_BASE_CONFIG', getBase);

  // register cli option
  registerCliOption(api);

  // register user config
  registerUserConfig(api);

  // modify user config to keep excute order
  modifyUserConfig(api);

  // set webpack config
  onGetWebpackConfig((chainConfig) => {
    // add resolve modules of project node_modules
    chainConfig.resolve.modules.add(path.join(rootDir, 'node_modules'));
  });

  if (command === 'test') {
    onHook('before.test.run', ({ config }) => {
      debug(JSON.stringify(config, null, 2));
    });

    onGetJestConfig((jestConfig) => {
      const { moduleNameMapper, ...rest } = jestConfig;

      Object.keys(moduleNameMapper).forEach(key => {
        // escape $ in the beginning. because $ match the end position end in regular expression
        // '^$ice/history$' -> '^\$ice/history$'
        if (key.indexOf('^$') === 0) {
          const newKey = `^\\${key.slice(1)}`;
          moduleNameMapper[newKey] = moduleNameMapper[key];
          delete moduleNameMapper[key];
        };
      });

      const defaultJestConfig = getJestConfig({ rootDir, moduleNameMapper });
      return {
        ...defaultJestConfig,
        ...rest,
        // defaultJestConfig.moduleNameMapper already combine jestConfig.moduleNameMapper
        moduleNameMapper: defaultJestConfig.moduleNameMapper,
      };
    });
  }

  if (command === 'start') {
    onHook('before.start.run', ({ config }) => {
      debug(JSON.stringify(config, null, 2));
    });
  }

  if (command === 'build') {
    onHook('before.build.run', ({ config }) => {
      debug(JSON.stringify(config, null, 2));
    });
  }
};
