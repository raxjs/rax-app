module.exports = class RemoveDefaultResultPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('RemoveDefaultResultPlugin', (compilation) => {
      compilation.hooks.shouldGenerateChunkAssets.tap(
        'disableGenerateChunkAssets',
        () => {
          return false;
        }
      );
    });
  }
};
