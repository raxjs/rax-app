import { emit } from '../utils/localBuildCache';

const PLUGIN_NAME = 'LocalBuilderPlugin';

export default class LocalBuilderPlugin {
  apply(compiler) {
    compiler.hooks.shouldEmit.tap(PLUGIN_NAME, (compilation) => {
      // Emit node build assets to web task
      emit(compilation.assets);
      return false;
    });
  }
}
