const chalk = require('chalk');
const { setConfig, setDevLog, setDevServer } = require('rax-multi-pages-settings');


module.exports = ({ context, onGetWebpackConfig, getValue, setValue, onHook }) => {
  // Value appType("spa" or "mpa", default "spa") is a new feature to support MPA;
  // See: https://github.com/raxjs/rax-scripts/issues/228
  const appType = getValue('appType');

  if (appType) {
    console.log();
    console.log(chalk.yellow('Warning! '));
    console.log(chalk.yellow('Package "build-plugin-rax-multi-pages" has been deprecated.'));
    console.log(chalk.yellow('Please use type: "mpa". example: '));
    console.log(chalk.yellow(`
// app.json
{
  "plugins": [
    [
      "build-plugin-rax-app",
      {
        "targets": ["web"],
        "type": "mpa"
      }
    ]
  ]
}    

See: https://rax.js.org/docs/guide/rax-plugin-app
    `));

    // Use new MPA feature.
    if (appType === 'mpa') {
      return;
    }
  } else {
    onHook('after.start.compile', ({ url, err, stats }) => {
      setDevLog({ url, err, stats });
    });
  }


  // Compatibility with old build-plugin-rax-multi-page
  const { command } = context;

  const targets = getValue('targets');
  setValue('raxMpa', true);

  if (targets.includes('web')) {
    onGetWebpackConfig('web', (config) => {
      if (command === 'start' && process.env.RAX_SSR !== 'true') {
        setDevServer({
          config,
          context,
          targets,
        });
      }

      setConfig(config, context, 'web');
    });
  }

  if (targets.includes('weex')) {
    onGetWebpackConfig('weex', config => {
      setConfig(config, context, 'weex');
    });
  }
};
