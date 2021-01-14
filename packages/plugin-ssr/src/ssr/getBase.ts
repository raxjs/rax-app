import { GET_RAX_APP_WEBPACK_CONFIG } from '../constants';

export default function (api) {
  const { getValue } = api;
  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);
  const config = getWebpackBase(api, {
    target: 'ssr',
    babelConfigOptions: { styleSheet: true },
    progressOptions: {
      name: 'SSR',
    },
  });
  config.name('node');
  return config;
}
