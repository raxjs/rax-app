const { start, build } = require('@alib/build-scripts');
const log = require('@alib/build-scripts/lib/utils/log');

const { DEFAULT_TYPE, DEFAULT_TARGET, DEFAULT_ENTRY, DEFAULT_RUNTIME_VERSION, DEFAULT_CONSTANT_DIR, DEFAULT_BUILD_TYPE, DEFAULT_DUAL_ENGINE } = require('./default');

async function baseProcess(command, options) {
  const { type, buildType, target, entry, distDir, constantDir, runtimeVersion, disableCopyNpm = false, turnOffSourceMap = false, afterCompiled, configWebpack, dualEngine } = options;
  process.env.DISABLE_STATS = true; // Disable webpack output info which is not useful in miniapp build
  const usedPlugin = [];
  const pluginParam = {
    targets: [target],
    [target]: {
      entryPath: entry,
      distDir, constantDir, disableCopyNpm, turnOffSourceMap, buildType, afterCompiled, configWebpack, dualEngine
    }
  };

  if (runtimeVersion !== DEFAULT_RUNTIME_VERSION) {
    console.warn(`You are currently not using default version(${DEFAULT_RUNTIME_VERSION}) of jsx2mp-runtime, please make sure that all of the dependencies of jsx2mp-runtime in your project are consistent.`);
  }
  if (type === 'project') {
    usedPlugin.push([
      require.resolve('build-plugin-rax-app'), pluginParam
    ]);
  } else if (type === 'component') {
    usedPlugin.push([
      require.resolve('build-plugin-rax-component'), {
        omitLib: true, // In build-plugin-rax-component, when targets only contain miniapp/wechat-miniprogram, it needs to generate lib/index.js just for the main entry in package.json, here we don't need the lib so omit that.
        ...pluginParam
      }
    ]);
  } else {
    log.error('Not supported type, please check your type param');
    return;
  }
  const buildScriptsCommand = command === 'start' ? start : build;
  try {
    return await buildScriptsCommand({
      args: {
        config: 'notExistPath' // Make build-scripts not read config from build.json
      },
      plugins: usedPlugin
    });
  } catch (err) {
    log.error(err.message);
    console.error(err);
  }
}

function ensureOptions(options) {
  return Object.assign({
    type: DEFAULT_TYPE,
    buildType: DEFAULT_BUILD_TYPE,
    target: DEFAULT_TARGET,
    entry: DEFAULT_ENTRY,
    constantDir: DEFAULT_CONSTANT_DIR,
    runtimeVersion: DEFAULT_RUNTIME_VERSION,
    dualEngine: DEFAULT_DUAL_ENGINE
  }, options);
}

async function devMiniApp(options) {
  const checkedOptions = ensureOptions(options);
  return await baseProcess('start', checkedOptions);
}

async function buildMiniApp(options) {
  const checkedOptions = ensureOptions(options);
  return await baseProcess('build', checkedOptions);
}

module.exports = {
  start: devMiniApp,
  build: buildMiniApp
};
