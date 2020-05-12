const qs = require('qs');

/**
 * An entry plugin which will set loader for entry before compile.
 *
 * Entry Loader for SSR need `publicPath` for assets path.
 * `publicPath` may be changed by other plugin after SSR plugin.
 * So the real `publicPath` can only get after all plugins have registed.
 */
class EntryPlugin {
  constructor(options) {
    this.options = options;
  }

  /**
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const {
      loader,
      entries,
      absoluteDocumentPath,
      absoluteShellPath
    } = this.options;

    const entryConfig = {};

    entries.forEach((entry) => {
      const {
        name,
        sourcePath,
        pagePath,
      } = entry;

      const query = {
        pagePath,
        absoluteDocumentPath,
        absoluteShellPath,
      };

      entryConfig[name] = `${loader}?${qs.stringify(query)}!${sourcePath}`;
    });

    compiler.options.entry = entryConfig;
  }
}

module.exports = EntryPlugin;
