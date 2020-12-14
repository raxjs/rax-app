const path = require('path');
const setMPAConfig = require('@builder/mpa-config');
const { getMpaEntries } = require('@builder/app-helpers');
const setDev = require('./setDev');
const setEntry = require('./setEntry');
const DocumentPlugin = require('./DocumentPlugin');
const { GET_RAX_APP_WEBPACK_CONFIG } = require('./constants');
const SnapshotPlugin = require('./SnapshotPlugin');

module.exports = (api) => {
  const {
    onGetWebpackConfig,
    getValue,
    context,
    registerTask,
    registerUserConfig,
    registerCliOption,
    modifyUserConfig,
  } = api;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const tempDir = getValue('TEMP_PATH');
  const target = 'web';
  const { userConfig = {} } = context;
  const webConfig = userConfig.web || {};
  const chainConfig = getWebpackBase(api, {
    target,
    babelConfigOptions: { styleSheet: userConfig.inlineStyle },
    progressOptions: {
      name: 'Web',
    },
  });
  chainConfig.name(target);
  chainConfig.taskName = target;
  registerUserConfig({
    name: target,
    validation: 'object',
  });

  // Set Entry
  setEntry(chainConfig, context);
  registerTask(target, chainConfig);

  if (webConfig.pha) {
    // Modify mpa config
    modifyUserConfig(() => {
      if (!context.userConfig.web) context.userConfig.web = {};
      context.userConfig.web.mpa = true;
      return context.userConfig;
    });
  }

  onGetWebpackConfig(target, (config) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { rootDir, command, userConfig } = context;
    const { outputDir } = userConfig;

    // Set output dir
    const outputPath = path.resolve(rootDir, outputDir, target);
    config.output.path(outputPath);

    if (command === 'start') {
      setDev(config);
    }

    const webpackConfig = config.toConfig();

    webpackConfig.target = 'node';

    webpackConfig.output.libraryTarget = 'commonjs2';
    // do not generate vendor.js when compile document
    // deep copy webpackConfig optimization, because the toConfig method is shallow copy
    webpackConfig.optimization = {
      ...webpackConfig.optimization,
      splitChunks: {
        ...webpackConfig.optimization.splitChunks,
        cacheGroups: {},
      },
    };

    config.plugin('document').use(DocumentPlugin, [
      {
        context,
        pages: [
          {
            entryName: 'index',
            path: '/',
          },
        ],
        doctype: webConfig.doctype,
        staticExport: webConfig.staticExport,
        webpackConfig,
      },
    ]);
    if (webConfig.snapshot) {
      config.plugin('SnapshotPlugin').use(SnapshotPlugin, [
        {
          withSSR: webConfig.ssr,
        },
      ]);
    }

    if (webConfig.mpa || webConfig.pha) {
      // support --mpa-entry to specify mpa entry
      registerCliOption({
        name: 'mpa-entry',
        commands: ['start'],
      });
      setMPAConfig.default(api, config, {
        context,
        type: 'web',
        targetDir: tempDir,
        entries: getMpaEntries(api, {
          target,
          appJsonPath: path.join(rootDir, 'src/app.json'),
        }),
      });
    }
  });
};
