import { GET_RAX_APP_WEBPACK_CONFIG } from '../constants';

export default function (api) {
  const { getValue, context: { userConfig: { inlineStyle, compileDependencies } } } = api;
  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const config = getWebpackBase(api, {
    target: 'ssr',
    babelConfigOptions: { styleSheet: inlineStyle },
    progressOptions: {
      name: 'SSR',
    },
  });
  config.name('node');

  // Set process env
  process.env.RAX_SSR = 'true';

  // SSR does not compile node_modules in full
  if (compileDependencies.length === 1 && compileDependencies[0] === '') {
    ['jsx', 'tsx'].forEach((rule) => {
      config.module
        .rule(rule)
        .exclude.clear()
        .add(/node_modules/);
    });
  }
  return config;
}
