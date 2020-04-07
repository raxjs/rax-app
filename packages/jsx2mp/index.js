const { start, build } = require('@alib/build-scripts');
const log = require('@alib/build-scripts/lib/utils/log');

const { DEFAULT_TYPE, DEFAULT_TARGETS, DEFAULT_ENTRY, DEFAULT_RUNTIME_VERSION, DEFAULT_CONSTANT_DIR } = require('./default');

async function baseProcess(command, options) {
  const { type, targets, entry, distDir, constantDir, runtimeVersion, disableCopyNpm = false, turnOffSourceMap = false } = options;
  const usedPlugin = [];
  const pluginParam = { targets, distDir, constantDir, disableCopyNpm, turnOffSourceMap };

  if (runtimeVersion !== DEFAULT_RUNTIME_VERSION) {
    console.warn(`You are currently not using default version(${DEFAULT_RUNTIME_VERSION}) of jsx2mp-runtime, please make sure that all of the dependencies of jsx2mp-runtime in your project are consistent.`);
  }
  if (type === 'project') {
    usedPlugin.push([
      'build-plugin-rax-app', pluginParam
    ]);
  } else if (type === 'component') {
    usedPlugin.push([
      'build-plugin-rax-component', {
        entry,
        ...pluginParam
      }
    ])
  } else {
    log.error('Not supported type, please check your type param');
    return;
  }
  const buildScriptsCommand = command === 'start' ? start : build;
  try {
    return await buildScriptsCommand({
      usedPlugin
    });
  } catch (err) {
    log.error(err.message);
    console.error(err);
  }
}

function ensureOptions(options) {
  return Object.assign({
    type: DEFAULT_TYPE,
    targets: DEFAULT_TARGETS,
    entry: DEFAULT_ENTRY,
    constantDir: DEFAULT_CONSTANT_DIR,
    runtimeVersion: DEFAULT_RUNTIME_VERSION
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
}
