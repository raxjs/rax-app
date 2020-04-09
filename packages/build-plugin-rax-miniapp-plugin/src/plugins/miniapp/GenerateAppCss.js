const { resolve } = require('path');
const { copySync, outputFile } = require('fs-extra');
const chokidar = require('chokidar');

/**
 * In plugin mode, app.acss/wxss doesn't exist so that __rax-view can't be placed which will affect the page/component which uses rax-view
 * This plugin generates a custom component just for import its css which contains __rax-view
 */
module.exports = class GenerateAppCssPlugin {
  constructor({ outputPath = '', platformInfo = {} }) {
    this.outputPath = outputPath;
    this.platformInfo = platformInfo;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'GenerateAppCssPlugin',
      (compilation, callback) => {
        const componentJS = 'Component({});';
        const componentJSON = '{"component":true}';
        const componentXML = '';
        const componentCSS = '.__rax-view {border: 0 solid black;display:flex;flex-direction:column;align-content:flex-start;flex-shrink:0;box-sizing:border-box;}';

        outputFile(resolve(this.outputPath, '__app_css', 'index.js'), componentJS);
        outputFile(resolve(this.outputPath, '__app_css', 'index.json'), componentJSON);
        outputFile(resolve(this.outputPath, '__app_css', `index${this.platformInfo.extension.xml}`), componentXML);
        outputFile(resolve(this.outputPath, '__app_css', `index${this.platformInfo.extension.css}`), componentCSS);
        callback();
      }
    );
  }
};
