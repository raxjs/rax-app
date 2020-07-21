const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const { RawSource, ConcatSource } = require('webpack-sources');
const adjustCSS = require('../utils/adjustCSS');
const adapter = require('../adapter');

const matchFile = (fileName, ext) =>
  ModuleFilenameHelpers.matchObject(
    { test: new RegExp(`\.${ext}$`) },
    fileName
  );

// Add content to chunks head and tail
module.exports = function (compilation, chunks, target) {
  chunks.forEach((chunk) => {
    chunk.files.forEach((fileName) => {
      if (matchFile(fileName, 'js')) {
        // Page js
        const headerContent =
          'module.exports = function(window, document) {const HTMLElement = window["HTMLElement"];';

        const footerContent = "}";

        compilation.assets[fileName] = new ConcatSource(
          headerContent,
          compilation.assets[fileName],
          footerContent
        );
      } else if (matchFile(fileName, 'css')) {
        compilation.assets[
          `${fileName}.${adapter[target].css}`
        ] = new RawSource(
          adjustCSS(compilation.assets[fileName].source())
        );
      }
    });
  });
};
