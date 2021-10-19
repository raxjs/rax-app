const { KRAKEN, WEB, MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, WEEX } = require('../constants');
const logDeprecatedConfig = require('./logDeprecatedConfig').default;

const taskList = [
  {
    name: WEB,
    children: ['pha', 'ssr'],
  },
  {
    name: WEEX,
  },
  {
    name: KRAKEN,
  },
];

[MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP].forEach((target) => {
  taskList.push({
    name: target,
    children: [`rax-compiled-components-${target}`],
  });
});

const deprecatedConfigMap = {
  esbuild: 'esbuild',
  terserOptions: 'terser',
};

module.exports = (api) => {
  const { context, modifyUserConfig, cancelTask, log } = api;
  const { userConfig } = context;
  const { targets: originalTargets, webpack5 } = userConfig;
  const { devTargets } = context.commandArgs;
  const newUserConfig = {
    ...userConfig,
    webpack5: Boolean(webpack5),
  };

  // Modify userConfig.targets
  if (devTargets) {
    const targets = devTargets.split(',');
    newUserConfig.targets = targets;
    // Cancel task
    if (originalTargets.length > targets.length) {
      const removeTargets = originalTargets.filter((target) => !targets.includes(target));
      taskList.forEach(({ name, children }) => {
        if (removeTargets.includes(name)) {
          cancelTask(name);
          if (children) {
            children.forEach((childTask) => cancelTask(childTask));
          }
        }
      });
    }
  }

  // Modify web mpa config with pha
  if (userConfig.web && userConfig.web.pha) {
    newUserConfig.web = {
      ...newUserConfig.web,
      mpa: true,
    };
  }

  // Unify all targets mpa config
  const hasMPA = newUserConfig.targets.some((target) => newUserConfig[target] && newUserConfig[target].mpa);
  if (hasMPA) {
    newUserConfig.targets.forEach((target) => {
      if (!newUserConfig[target]) {
        newUserConfig[target] = {};
      }
      newUserConfig[target] = {
        ...newUserConfig[target],
        mpa: true,
      };
    });
  }

  // Deprecate in v4.0
  // Minify options
  let deprecatedConfigkey;
  if (newUserConfig.esbuild) {
    newUserConfig.minify = {
      type: 'esbuild',
      options: newUserConfig.esbuild,
    };
    deprecatedConfigkey = 'esbuild';
  } else if (newUserConfig.terserOptions) {
    newUserConfig.minify = {
      type: 'terser',
      options: newUserConfig.terserOptions,
    };
    deprecatedConfigkey = 'terserOptions';
  }

  logDeprecatedConfig(
    log,
    deprecatedConfigkey,
    `Please use \n${JSON.stringify({
      minify: {
        type: deprecatedConfigMap[deprecatedConfigkey],
        options: userConfig[deprecatedConfigkey],
      },
    }, null, 2)}`,
  );

  modifyUserConfig(() => {
    return newUserConfig;
  });
};
