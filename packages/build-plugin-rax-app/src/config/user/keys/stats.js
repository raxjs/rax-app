module.exports = {
  defaultValue: true,
  validation: 'boolean',
  configWebpack: (config, value, context) => {
    const { command } = context;

    // disable webpack stats log
    if (command === 'start' && value) {
      process.env.DISABLE_STATS = true;
    }
  },
};
