module.exports = {
  defaultValue: {
    compress: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    hot: true,
    overlay: false,
    // Close dev server started message prior.
    quiet: false,
    noInfo: true,
  },
  validation: 'object',
  configWebpack: (config, value, context) => {
    const { command } = context;

    if (command === 'start') {
      config.merge({ devServer: value });
    }
  },
};
