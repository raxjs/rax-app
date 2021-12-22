const resolvePlugin = require('./resolvePlugin');

module.exports = function () {
  return {
    plugins: resolvePlugin([
      // Stage 2
      ['@builder/pack/deps/@babel/plugin-proposal-decorators', { legacy: true }],
      // Stage 3
      [
        '@builder/pack/deps/@babel/plugin-proposal-class-properties',
        { loose: true },
      ],
    ]),
  };
};
