const getSSRBaseConfig = require('rax-ssr-config');

const EntryLoader = require.resolve('./entryLoader');

module.exports = (context) => {
  const config = getSSRBaseConfig({
    ...context,
    output: {
      fileName: 'nsr/[name].js',
      libraryTarget: 'umd'
    },
    entryLoader: EntryLoader,
  });

  return config;
};
