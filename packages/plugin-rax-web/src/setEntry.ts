import getAppEntry from './utils/getAppEntry';

export default (config, context) => {
  const {
    rootDir,
    command,
    userConfig: { web = {} },
  } = context;
  const isDev = command === 'start';

  if (!web.mpa) {
    // SPA
    const appEntry = getAppEntry(rootDir);
    const entryConfig = config.entry('index');

    config.module.rule('appJSON').use('loader');

    if (isDev) {
      entryConfig.add(require.resolve('react-dev-utils/webpackHotDevClient'));
    }
    entryConfig.add(appEntry);
  }
};

