const getSSRBaseConfig = require('rax-ssr-config');

const EntryLoader = require.resolve('./entryLoader');

// Can‘t clone webpack chain object, so generate a new chain and reset config
module.exports = (context) => {
  const config = getSSRBaseConfig({
    ...context,
    output: {
      fileName: 'node/[name].js',
      libraryTarget: 'commonjs2'
    },
    entryLoader: EntryLoader,
  });

  config.target('node');

  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('platform')
      .options({
        platform: 'node',
      });
  });

  return config;
};
