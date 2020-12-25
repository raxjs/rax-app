const getBuiltInPlugins = (userConfig) => {
  const { targets = ['web'], store = true } = userConfig;

  // built-in plugins for rax app
  const builtInPlugins = [
    [
      'build-plugin-app-core',
      {
        framework: 'rax',
        alias: 'rax-app',
      },
    ],
    ['build-plugin-rax-app'],
    'build-plugin-ice-config',
  ];

  if (store) {
    builtInPlugins.push(['build-plugin-rax-store']);
  }

  if (targets.includes('web')) {
    builtInPlugins.push(['build-plugin-rax-web']);
    if (userConfig.web) {
      if (userConfig.web.ssr) {
        builtInPlugins.push(['build-plugin-ssr']);
      }
      if (userConfig.web.pha) {
        builtInPlugins.push(['build-plugin-rax-pha']);
      }
    }
  }

  if (targets.includes('weex')) {
    builtInPlugins.push(['build-plugin-rax-weex']);
  }

  if (targets.includes('kraken')) {
    builtInPlugins.push(['build-plugin-rax-kraken']);
  }

  if (
    targets.includes('miniapp') ||
    targets.includes('wechat-miniprogram') ||
    targets.includes('bytedance-microapp')
  ) {
    builtInPlugins.push(['build-plugin-rax-miniapp']);
  }

  return builtInPlugins;
};

export = getBuiltInPlugins;
