const fse = require('fs-extra');

module.exports = class BuildManifestPlugin {
  constructor(options) {
    this.pages = options.pages;
    this.destPath = options.destPath;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'BuildManifestPlugin',
      (compilation, callback) => {
        const publicPath = compiler.options.output.publicPath;
        const assetMap = {};

        this.pages.map(pages => {
          let files = [];

          if (compilation.entrypoints.get(pages.entryName)) {
            files = compilation.entrypoints.get(pages.entryName).getFiles();
          } else {
            // In SPA, use `index` as entry
            files = compilation.entrypoints.get('index').getFiles();
          }

          const pagesAssets = {
            scripts: [],
            styles: []
          };

          for (const file of files) {
            if (/\.js$/.test(file)) {
              pagesAssets.scripts.push(publicPath + file.replace(/\\/g, '/'));
            }

            if (/\.css$/.test(file)) {
              pagesAssets.styles.push(publicPath + file.replace(/\\/g, '/'));
            }
          }

          assetMap[pages.path] = pagesAssets;
        });

        fse.ensureFileSync(this.destPath);
        fse.writeFileSync(this.destPath, JSON.stringify(assetMap, null, 2), 'utf-8');

        callback();
      });
  }
};
