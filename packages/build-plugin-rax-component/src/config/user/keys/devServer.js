module.exports = {
  defaultValue: {
    compress: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    hot: true,
    quiet: true,
    overlay: false,
    port: 9999,
  },
  validation: 'object',
  configWebpack: (config, value, context) => {
    const { command } = context;

    if (command === 'start') {
      config.merge({ devServer: value });
    }
  },
};