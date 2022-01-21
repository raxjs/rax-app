const checkPostcssLoader = (config, ruleName) =>
  config.module.rules.has(ruleName) && config.module.rule(ruleName).uses.has('postcss-loader');

export default function proxyPostcssOptions({ context, onHook }) {
  const styleRules = [
    'css',
    'css-module',
    'css-global',
    'scss',
    'scss-module',
    'scss-global',
    'less',
    'less-module',
    'less-global',
  ];
  const shouldProxyKeys = ['exec', 'parser', 'syntax', 'stringifier', 'config', 'plugins'];

  const { command } = context;

  onHook(`before.${command}.load`, ({ webpackConfig }) => {
    webpackConfig.forEach(({ chainConfig: config }) => {
      styleRules.forEach((ruleName) => {
        // check if have `postcss-loader`
        if (checkPostcssLoader(config, ruleName)) {
          const loader = config.module.rule(ruleName).use('postcss-loader');

          // proxy `postcss-loader` options
          config.module.rule(ruleName).uses.set(
            'postcss-loader',
            // eslint-disable-next-line
            new Proxy(loader, {
              get(target, property) {
                if (property === 'toConfig') {
                  return () => {
                    const loaderConfig = loader.toConfig();
                    const { options } = loaderConfig;

                    Object.entries(options).forEach(([key, value]) => {
                      if (shouldProxyKeys.includes(key)) {
                        const postcssOptions = options.postcssOptions || {};

                        if (key === 'exec') {
                          options.execute = value;
                          delete options.exec;
                          return;
                        }

                        if (key === 'plugins') {
                          options.postcssOptions = {
                            ...postcssOptions,
                            plugins: [...(postcssOptions.plugins || []), ...((value as any) || [])],
                          };
                          delete options.plugins;
                          return;
                        }

                        options.postcssOptions = {
                          ...postcssOptions,
                          [key]: value,
                        };
                        delete options[key];
                      }
                    });

                    return loaderConfig;
                  };
                }

                return target[property];
              },
            }),
          );
        }
      });
    });
  });
}
