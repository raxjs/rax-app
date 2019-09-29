const { getWebBase } = require('rax-plugin-app');

const getEntries = require('./getEntries');

// Can‘t clone webpack chain object, so generate a new chain and reset config
module.exports = (context) => {
  const { userConfig } = context;
  const config = getWebBase(context);

  config.entryPoints.clear();

  ['jsx', 'tsx'].forEach(tag => {
    config.module.rule(tag)
      .use('babel')
        .tap(options => {
          options.presets = options.presets.map(v => {
            if (Array.isArray(v) && v[0].indexOf('@babel/preset-env')) {
              const args = {
                ... v[1],
                targets: {
                  node: '8',
                },
              }

              return [v[0], args];
            }

            return v;
          })

          return options;
        });
  });

  const entries = getEntries(config, context);
  Object.keys(entries).forEach((key) => {
    config.entry(key)
      .add(entries[key]);
  });

  config.target('node');

  config.output
    .filename('server/[name].js')
    .libraryTarget('commonjs2');

  config.plugins.delete('document');
  config.plugins.delete('PWAAppShell');

  if (!userConfig.inlineStyle) {
    config.plugins.delete('minicss');
    config.module.rules.delete('css');
    config.module.rule('css')
    .test(/\.css?$/)
    .use('ignorecss')
      .loader(require.resolve('./ignoreLoader'))
      .end();
  }

  config.module.rules.delete('appJSON');
  return config;
};
