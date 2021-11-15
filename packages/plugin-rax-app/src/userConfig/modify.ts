import hasProperty from '../utils/hasProperty';
import logDeprecatedConfig from '../utils/logDeprecatedConfig';
import { KRAKEN, WEB, MINIAPP, WECHAT_MINIPROGRAM, BYTEDANCE_MICROAPP, WEEX, DEPRECATED_CONFIG, MINIAPP_PLATFORMS } from '../constants';

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

export default (api) => {
  const { context, modifyUserConfig, cancelTask, log } = api;
  const { userConfig } = context;
  const { targets: originalTargets, webpack5, swc } = userConfig;
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
    newUserConfig.targets
      // Avoid miniapp runtime mode be became MPA
      .filter((target) => !MINIAPP_PLATFORMS.includes(target))
      .forEach((target) => {
        if (!newUserConfig[target]) {
          newUserConfig[target] = {};
        }
        newUserConfig[target] = {
          ...newUserConfig[target],
          mpa: true,
        };
      });

    // Warning tip when use miniapp runtime mode with MPA
    for (const target of newUserConfig.targets) {
      if (MINIAPP_PLATFORMS.includes(target) && !newUserConfig[target]?.subpackages) {
        log.error('小程序非分包模式不推荐和 MPA 应用同时使用，下一个大版本将禁止该能力！');
      }
    }
  }

  // Deprecate in v4.0
  // Minify options
  Object.keys(DEPRECATED_CONFIG).forEach((deprecatedConfigkey) => {
    if (hasProperty(userConfig, deprecatedConfigkey)) {
      newUserConfig.minify = {
        type: deprecatedConfigkey,
        options: newUserConfig[deprecatedConfigkey],
      };
      logDeprecatedConfig(log, deprecatedConfigkey, `Please use \n${JSON.stringify(newUserConfig.minify, null, 2)}`);
    }
  });

  if (swc) {
    // Modify minify config
    if (!hasProperty(userConfig, 'minify')) {
      newUserConfig.minify = 'swc';
    }

    // Warning in the cases that are not applicable
    if (newUserConfig.targets.some((target) => MINIAPP_PLATFORMS.includes(target))) {
      log.warn('小程序构建暂未支持 swc，页面生命周期以及与原生混用能力将失效，后续将完善该场景');
    }
  }

  modifyUserConfig(() => {
    return newUserConfig;
  });
};
