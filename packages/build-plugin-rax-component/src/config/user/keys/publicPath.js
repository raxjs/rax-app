module.exports = {
  defaultValue: './',
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { command } = context;

    if (command === 'build') {
      config.output.publicPath(value);
    }
  },
};
