import { emit } from '../utils/localBuildCache';

const PLUGIN_NAME = 'LocalBuilderPlugin';

export default class LocalBuilderPlugin {
  apply(compiler) {
    compiler.hooks.shouldEmit.tap(PLUGIN_NAME, (compilation) => {
      emit(compilation.assets);
      return false;
    });
  }
}
