const PLUGIN_NAME = 'LocalBuilderPlugin';

export default class LocalBuilderPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      console.log(Object.keys(compilation.assets));
      callback();
    });
  }
}
