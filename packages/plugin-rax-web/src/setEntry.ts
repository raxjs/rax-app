import getAppEntry from './utils/getAppEntry';

export default (config, context) => {
  const {
    rootDir,
    userConfig: { web = {} },
  } = context;

  if (!web.mpa) {
    // SPA
    const { entryPath } = getAppEntry(rootDir);

    if (!entryPath) {
      throw new Error('项目目录缺少 src/app.ts 入口文件!');
    }

    const entryConfig = config.entry('index');

    entryConfig.add(entryPath);
  }
};
