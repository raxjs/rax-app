/**
 * Save To Desktop Plugin
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen
 * 1. create manifest.json
 * 2. process icon file to multi-size
 * 3. set HTML header tags
 * 4. support iOS
 */


const path = require('path');
const { RawSource } = require('webpack-sources');
const { readJsonSync } = require('fs-extra');
const { transformAppConfig, getPageManifestByPath } = require('../manifestHelpers');

const PLUGIN_NAME = 'PWA_SaveToDesktopPlugin';

const defaultManifest = {
  start_url: '.',
  display: 'standalone',
};

module.exports = class SaveToDesktopPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { context, saveToDesktop } = this.options;

    if (!saveToDesktop) {
      return;
    }

    const { rootDir, userConfig } = context;
    const appConfig = readJsonSync(path.resolve(rootDir, 'src/app.json'));
    const decamelizeAppConfig = transformAppConfig(appConfig);

    const manifest = getPageManifestByPath({
      ...this.options,
      decamelizeAppConfig
    });

    if (!manifest) {
      // Exit if no manifest config
      return;
    }
    const publicPath = userConfig.publicPath || '/';
    let tags = `<link rel="manifest" href="${publicPath}web/manifest.json" />`;

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const icons = [];

      if (!manifest.icons) throw new Error('Can not find icons in manifest');
      // Process image
      manifest.icons.forEach((icon) => {
        const { sizes, type, src } = icon;
        const iconSrc = publicPath + src;
        // Add icon
        icons.push({
          src: iconSrc,
          sizes,
          type,
        });
        // Write tags for iOS
        tags += `<link rel="apple-touch-icon" sizes="${sizes}" href="${iconSrc}">`;
      });

      // Write manifest.json
      const manifestJSONValue = {
        ...defaultManifest,
        ...manifest,
        icons,
      };
      compilation.assets['web/manifest.json'] = new RawSource(JSON.stringify(manifestJSONValue));
      // Generate Html tags
      compilation.assets['web/index.html'] = new RawSource(
        compilation.assets['web/index.html'].source().replace('<head>', `<head>${tags}`),
      );
      callback();
    });
  }
};