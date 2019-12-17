const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

const getEntries = require('./getEntries');
const setEntry = require('./setEntry');
const setDevServer = require('./setDevServer');

module.exports = ({ context, onGetWebpackConfig, getValue, setValue, onHook }) => {
  const { command } = context;
  const entries = getEntries(context);

  const targets = getValue('targets');
  setValue('raxMpa', true);

  if (targets.includes('web')) {
    onGetWebpackConfig('web', (config) => {
      if (command === 'start' && process.env.RAX_SSR !== 'true') {
        setDevServer({
          config,
          context,
          targets,
          entries,
        });
      }

      setEntry(config, context, entries, 'web');

      config.plugin('document').tap(args => {
        return [{
          ...args[0],
          isMultiple: true,
        }];
      });
    });
  }

  if (targets.includes('weex')) {
    onGetWebpackConfig('weex', config => {
      setEntry(config, context, entries, 'weex');
    });
  }

  onHook('after.devCompile', async({ url, err, stats }) => {
    consoleClear(true);

    if (!handleWebpackErr(err, stats)) {
      return;
    }

    console.log(chalk.green('Rax development server has been started:'));
    console.log();

    console.log(chalk.green('Multi pages development server at:'));
    console.log('   ', chalk.underline.white(url));
    console.log();
  });
};
