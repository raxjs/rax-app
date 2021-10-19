
import setStaticConfig from './setStaticConfig';
import getBase from '../base';
import {
  GET_RAX_APP_WEBPACK_CONFIG,
  REACT_TRANSFORM_CONFIG,
  MINIFY_TASKS,
  MINIAPP,
  WECHAT_MINIPROGRAM,
  KUAISHOU_MINIPROGRAM,
  BAIDU_SMARTPROGRAM,
  BYTEDANCE_MICROAPP,
} from '../constants';

export default function (api) {
  const { setValue, context } = api;
  const { userConfig } = context;

  setValue(GET_RAX_APP_WEBPACK_CONFIG, getBase);

  // rax transform options
  setValue(REACT_TRANSFORM_CONFIG, {
    importSource: 'rax',
    pragma: 'createElement',
    pragmaFrag: 'Fragment',
  });

  setStaticConfig(api);

  if (userConfig.minify) {
    let enableMiniAppMinify = false;
    if (typeof userConfig.minify === 'object') {
      enableMiniAppMinify = userConfig.minify.miniappDevMode;
    } else {
      enableMiniAppMinify = true;
    }
    if (enableMiniAppMinify) {
      setValue(MINIFY_TASKS, [MINIAPP, WECHAT_MINIPROGRAM, KUAISHOU_MINIPROGRAM, BAIDU_SMARTPROGRAM, BYTEDANCE_MICROAPP]);
    }
  }
}
