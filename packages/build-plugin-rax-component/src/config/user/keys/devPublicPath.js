module.exports = {
  defaultValue: '/',
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { command } = context;

    if (command === 'start') {
      config.output.publicPath(value);
    }
  },
};