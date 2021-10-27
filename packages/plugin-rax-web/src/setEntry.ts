import getAppEntry from './utils/getAppEntry';

export default (config, context) => {
  const {
    rootDir,
    userConfig: { web = {} },
  } = context;

  if (!web.mpa) {
    // SPA
    const { entryPath } = getAppEntry(rootDir);
    const entryConfig = config.entry('index');

    config.module.rule('appJSON').use('loader');
    entryConfig.add(entryPath);
  }
};
