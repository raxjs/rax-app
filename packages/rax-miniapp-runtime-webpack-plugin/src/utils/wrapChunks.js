const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
const ConcatSource = require('webpack-sources').ConcatSource;

// Add content to chunks head and tail
module.exports = function(compilation, chunks) {
  chunks.forEach(chunk => {
    chunk.files.forEach(fileName => {
      if (ModuleFilenameHelpers.matchObject({ test: /\.js$/ }, fileName)) {
        // Page js
        const headerContent = 'module.exports = function(window, document) {const App = function(options) {window.appOptions = options};var HTMLElement = window["HTMLElement"];';

        const footerContent = '}';

        compilation.assets[fileName] = new ConcatSource(
          headerContent,
          compilation.assets[fileName],
          footerContent
        );
      }
    });
  });
};
