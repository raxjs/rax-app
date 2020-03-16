

const setConfig = require('./setConfig');
const setDevLog = require('./setDevLog');
const setDevServer = require('./setDevServer');

module.exports = {
  setConfig,
  setDevLog,
  setDevServer
};


const test = ({ context, onGetWebpackConfig, getValue, setValue, onHook }) => {
  const { command } = context;

  const targets = getValue('targets');
  setValue('raxMpa', true);

  if (targets.includes('web')) {
    onGetWebpackConfig('web', (config) => {
      if (command === 'start') {
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

  });
};
