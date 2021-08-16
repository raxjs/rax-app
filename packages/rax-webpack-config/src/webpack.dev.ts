import * as TimeFixPlugin from '@builder/pack/deps/time-fix-plugin';

export default (config) => {
  // TODO webpack5 确认下会不会影响 webpack4 的日志输出
  // custom stat output by stats.toJson() calls
  config.stats('none');
  // set source map, https://webpack.js.org/configuration/devtool/#devtool
  config.devtool('cheap-module-source-map');
  // fix: https://github.com/webpack/watchpack/issues/25
  config.plugin('TimeFixPlugin').use(TimeFixPlugin);
};
