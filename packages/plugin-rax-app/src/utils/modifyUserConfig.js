const { KRAKEN, WEB, MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, WEEX } = require('../constants');

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

module.exports = (api) => {
  const { context, modifyUserConfig, cancelTask } = api;
  const {
    userConfig,
  } = context;
  const { targets: originalTargets, webpack5 } = userConfig;
  const { devTargets } = context.commandArgs;

  // Modify userConfig.targets
  if (devTargets) {
    const targets = devTargets.split(',');
    modifyUserConfig((originConfig) => {
      return {
        ...originConfig,
        targets,
      };
    });
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

  // Modify userConfig.webpack5
  if (webpack5 === undefined) {
    modifyUserConfig((originConfig) => {
      return {
        ...originConfig,
        webpack5: false,
      };
    });
  }

  // Modify web mpa config with pha
  if (userConfig.web && userConfig.web.pha) {
    modifyUserConfig((originConfig) => {
      return {
        ...originConfig,
        web: {
          ...originConfig.web,
          mpa: true,
        },
      };
    });
  }

  // Unify all targets mpa config
  const hasMPA = userConfig.targets.filter((target) => userConfig[target] && userConfig[target].mpa);
  if (hasMPA) {
    modifyUserConfig((originConfig) => {
      const newConfig = {
        ...originConfig,
        // Add document mpa config for RouteLoader
        document: {
          ...originConfig.document,
          mpa: true,
        },
      };
      originConfig.targets.forEach((target) => {
        if (!newConfig[target]) {
          newConfig[target] = {};
        }
        newConfig[target] = {
          ...newConfig[target],
          mpa: true,
        };
      });
      return newConfig;
    });
  }
};
