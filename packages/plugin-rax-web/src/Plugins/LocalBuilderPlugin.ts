import { emit, updateEnableStatus } from '../utils/localBuildCache';

const PLUGIN_NAME = 'LocalBuilderPlugin';

export default class LocalBuilderPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      // Before every compile set enable status as true
      updateEnableStatus(true);
      callback();
    });

    compiler.hooks.shouldEmit.tap(PLUGIN_NAME, (compilation) => {
      // Emit node build assets to web task
      emit(compilation.assets);
      return false;
    });
  }
}
