const chalk = require('chalk');
const consoleClear = require('console-clear');
const { handleWebpackErr } = require('rax-compile-config');

const getEntries = require('./getEntries');
const setEntry = require('./setEntry');
const setDevServer = require('./setDevServer');

module.exports = ({ context, chainWebpack, onHook }) => {
  const { command } = context;
  const entries = getEntries(context);

  let targets = [];

  chainWebpack((config) => {
    targets = context.__configArr.map(v => v.name);

    if (command === 'dev' && process.env.RAX_SSR !== 'true') {
      setDevServer({
        config,
        context,
        targets,
        entries,
      });
    }

    if (targets.includes('web')) {
      const webConfig = config.getConfig('web');

      setEntry(webConfig, context, entries, 'web');

      webConfig.plugin('document').tap(args => {
        return [{
          ...args[0],
          isMultiple: true,
        }];
      });
    }

    if (targets.includes('weex')) {
      setEntry(config.getConfig('weex'), context, entries, 'weex');
    }
  });

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
