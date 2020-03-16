const { setConfig, setDevLog, setDevServer } = require('rax-multi-pages-config');


module.exports = ({ context, onGetWebpackConfig, getValue, setValue, onHook }) => {
  if (getValue('appType')) {
    console.warn('"build-plugin-rax-multi-pages" has been deprecated.');
    console.warn('Please use type "mpa". example: ');
    console.warn(`
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
    `);
    console.warn();

    if (getValue('appType') === 'mpa') {
      return;
    }
  }

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

  onHook('after.start.compile', async({ url, err, stats }) => {
    setDevLog({ url, err, stats });
  });
};
