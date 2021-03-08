import * as fs from 'fs-extra';
import * as path from 'path';

const builtInPlugins = ['build-plugin-rax-multi-pages', 'build-plugin-rax-ssr'];

export default function (fileInfo) {
  const appJSON = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/app.json')));
  let buildConfig = JSON.parse(fileInfo.source);
  let staticExport = false;
  let snapshot = false;
  let mpa = false;
  if (buildConfig.plugins.includes('build-plugin-rax-multi-pages')) {
    mpa = true;
  }
  const pluginCore = buildConfig.plugins.find((plugin) => {
    return Array.isArray(plugin) && plugin[0] === 'build-plugin-rax-app';
  });
  const pluginCoreOptions = pluginCore[1] || {};
  buildConfig.plugins = deletePlugin(buildConfig.plugins, buildConfig.plugins.indexOf(pluginCore));
  builtInPlugins.forEach((pluginName) => {
    const index = buildConfig.plugins.indexOf(pluginName);
    if (index > -1) {
      buildConfig.plugins = deletePlugin(buildConfig.plugins, index);
    }
  });
  if (pluginCoreOptions.type === 'mpa') {
    mpa = true;
  }
  delete pluginCoreOptions.type;

  // snapshot
  const pwaPlugin = buildConfig.plugins.find((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] === 'build-plugin-rax-pwa';
    } else {
      return plugin === 'build-plugin-rax-pwa';
    }
  });
  if (Array.isArray(pwaPlugin)) {
    const pwaPluginOptions = pwaPlugin[1];
    if (Object.prototype.hasOwnProperty.call(pwaPluginOptions, 'snapshot')) {
      snapshot = pluginCoreOptions.snapshot;
    }
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
  console.log('buildConfig', buildConfig);

  // web config
  if (buildConfig.targets.includes('web')) {
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
    if (Object.prototype.hasOwnProperty.call(appJSON, 'hydrate')) {
      buildConfig.web.hydrate = appJSON.hydrate;
    }
  }

  // weex config
  if (buildConfig.targets.includes('weex')) {
    if (mpa) {
      buildConfig.weex = {
        mpa: true,
      };
    }
  }

  return JSON.stringify(buildConfig, null, 2);
}

function deletePlugin(plugins, index) {
  return [...plugins.slice(0, index), ...plugins.slice(index + 1, plugins.length)];
}
