import { emit } from '../utils/localBuildCache';

const PLUGIN_NAME = 'LocalBuilderPlugin';

export default class LocalBuilderPlugin {
  apply(compiler) {
    console.log('compiler.options.externalsPresets ====> ', compiler.options.externalsPresets);
    compiler.hooks.shouldEmit.tap(PLUGIN_NAME, (compilation) => {
      // Emit node build assets to web task
      emit(compilation.assets);
      return true;
    });
  }
}
