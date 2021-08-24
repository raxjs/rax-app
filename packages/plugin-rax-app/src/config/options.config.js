module.exports = {
  'enable-assets': {
    module: false,
    commands: ['start'],
  },
  'dev-targets': {
    module: false,
    commands: ['start'],
  },
  'analyzer-target': {
    module: require.resolve('../cliOptions/analyzerTarget'),
    commands: ['start', 'build'],
  },
};
