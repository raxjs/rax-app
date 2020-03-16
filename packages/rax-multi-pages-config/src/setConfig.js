const path = require('path');
const { hmrClient } = require('rax-compile-config');
const getEntries = require('./getEntries');

const MulitPageLoader = require.resolve('./MulitPageLoader');

function getDepPath(rootDir, com) {
  if (com[0] === '/') {
    return path.join(rootDir, 'src', com);
  } else {
    return path.resolve(rootDir, 'src', com);
  }
};

module.exports = (config, context, type) => {
  const { rootDir, command } = context;
  const isDev = command === 'start';
  const entries = getEntries(context);

  config.entryPoints.clear();

  entries.forEach(({ entryName, source }) => {
    const entryConfig = config.entry(entryName);
    if (isDev && process.env.RAX_SSR !== 'true') {
      entryConfig.add(hmrClient);
    }

    const pageEntry = getDepPath(rootDir, source);
    entryConfig.add(`${MulitPageLoader}?type=${type}!${pageEntry}`);
  });

  if (type === 'web') {
    config.plugin('document').tap(args => {
      return [{
        ...args[0],
        pages: entries
      }];
    });
  }
};
