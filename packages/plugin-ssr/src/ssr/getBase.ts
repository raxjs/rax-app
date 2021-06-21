import { GET_RAX_APP_WEBPACK_CONFIG } from '../constants';

export default function (api) {
  const { getValue, context: { userConfig: { inlineStyle } } } = api;
  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const config = getWebpackBase(api, {
    target: 'ssr',
    babelConfigOptions: { styleSheet: inlineStyle, jsxToHtml: true },
    progressOptions: {
      name: 'SSR',
    },
  });
  config.name('node');

  // Set process env
  process.env.RAX_SSR = 'true';

  return config;
}
