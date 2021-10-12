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
    modifyUserConfig(() => {
      context.userConfig.targets = targets;
      return context.userConfig;
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
    modifyUserConfig(() => {
      context.userConfig.webpack5 = false;
      return context.userConfig;
    });
  }

  // Unify all targets mpa config
  const hasMPA = userConfig.targets.filter((target) => userConfig[target] && userConfig[target].mpa);
  if (hasMPA) {
    userConfig.targets.forEach((target) => {
      if (!userConfig[target]) {
        userConfig[target] = {};
      }
      userConfig[target].mpa = true;
    });

    if (!userConfig.document) {
      userConfig.document = {};
    }
    userConfig.document.mpa = true;
  }
};
