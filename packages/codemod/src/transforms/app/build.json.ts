import * as fs from 'fs-extra';
import * as path from 'path';

const builtInPlugins = ['build-plugin-rax-multi-pages', 'build-plugin-rax-ssr'];

export default function (fileInfo) {
  const appJSON = JSON.parse(fs.readFileSync(path.join(process.cwd(), path.dirname(fileInfo.path), 'src/app.json')));
  let buildConfig = JSON.parse(fileInfo.source);

  const pluginCore = buildConfig?.plugins.find((plugin) => {
    return Array.isArray(plugin) && plugin[0] === 'build-plugin-rax-app';
  });
  if (!pluginCore) {
    return fileInfo.source;
  }

  let staticExport = false;
  let snapshot = false;
  let mpa = false;
  let ssr;
  let doctype;
  if (buildConfig.plugins.includes('build-plugin-rax-multi-pages')) {
    mpa = true;
  }

  const pluginCoreOptions = pluginCore[1] || {};
  buildConfig.plugins = deletePlugin(buildConfig.plugins, buildConfig.plugins.indexOf(pluginCore));
  builtInPlugins.forEach((pluginName) => {
    const index = buildConfig.plugins.indexOf(pluginName);
    if (index > -1) {
      if (pluginName === 'build-plugin-rax-ssr') {
        ssr = true;
      }
      buildConfig.plugins = deletePlugin(buildConfig.plugins, index);
    }
  });
  if (pluginCoreOptions.type === 'mpa') {
    mpa = true;
  }
  delete pluginCoreOptions.type;

  if (Object.prototype.hasOwnProperty.call(pluginCoreOptions, 'doctype')) {
    doctype = pluginCoreOptions.doctype;
    delete pluginCoreOptions.doctype;
  }

  const pwaPlugin = buildConfig.plugins.find((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] === 'build-plugin-rax-pwa' || plugin[0] === 'build-plugin-rax-pha';
    } else {
      return plugin === 'build-plugin-rax-pwa' || plugin === 'build-plugin-rax-pha';
    }
  });
  if (Array.isArray(pwaPlugin)) {
    const pwaPluginOptions = pwaPlugin[1];
    // snapshot
    if (Object.prototype.hasOwnProperty.call(pwaPluginOptions, 'snapshot')) {
      snapshot = pluginCoreOptions.snapshot;
    }
    // serviceWorker
    if (pwaPluginOptions.serviceWorker) {
      console.error('rax-app 3.x 暂不支持 serviceWorker');
    }
  }
  if (pwaPlugin) {
    buildConfig.plugins = deletePlugin(buildConfig.plugins, buildConfig.plugins.indexOf(pwaPlugin));
  }

  // static export
  if (Object.prototype.hasOwnProperty.call(pluginCoreOptions, 'staticExport')) {
    staticExport = pluginCoreOptions.staticExport;
    delete pluginCoreOptions.staticExport;
  }

  if (!Object.prototype.hasOwnProperty.call(buildConfig, 'inlineStyle')) {
    buildConfig.inlineStyle = true;
  }
  buildConfig = {
    ...pluginCoreOptions,
    ...buildConfig,
  };

  buildConfig.targets.forEach((target) => {
    switch (target) {
      // web config
      case 'web':
        buildConfig.web = {};
        if (staticExport) {
          buildConfig.web.staticExport = staticExport;
        }
        if (snapshot) {
          buildConfig.web.snapshot = snapshot;
        }
        if (mpa) {
          buildConfig.web.mpa = true;
        }
        if (doctype !== undefined) {
          buildConfig.web.doctype = doctype;
        }
        if (ssr !== undefined) {
          buildConfig.web.ssr = ssr;
        }
        if (Object.prototype.hasOwnProperty.call(appJSON, 'hydrate')) {
          buildConfig.web.hydrate = appJSON.hydrate;
        }
        break;
      // weex config
      case 'weex':
        if (mpa) {
          buildConfig.weex = {
            mpa: true,
          };
        }
        break;
      // miniapp
      case 'miniapp':
      case 'wechat-miniprogram':
        if (!buildConfig[target]) {
          buildConfig[target] = {
            buildType: 'compile',
          };
        }
        break;
      default:
    }
  });

  return JSON.stringify(buildConfig, null, 2);
}

function deletePlugin(plugins, index) {
  return [...plugins.slice(0, index), ...plugins.slice(index + 1, plugins.length)];
}
