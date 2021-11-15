import * as loaderUtils from 'loader-utils';
import { formatPath } from '@builder/app-helpers';
import { DEVICE_LEVEL } from '../constants';
import { IAppWorkerLoaderOptions, ILoadAppDefineOptions } from '../types';

export default function AppWorkerLoader(code) {
  const options: IAppWorkerLoaderOptions = this.getOptions ? this.getOptions() : loaderUtils.getOptions(this);

  return `${loadAppDefine(this, {
    ...options,
    code,
  })}`;
}

function loadAppDefine(ctx, options: ILoadAppDefineOptions) {
  const { appType } = options;
  let output = `var $app_script$ = ${getAppScriptAssign(ctx, options)}
  `;

  if (appType === DEVICE_LEVEL.RICH) {
    output += `
    $app_define$('@app-application/app', [], function(app_require, $app_exports$, $app_module$) {
      $app_require$ = app_require;
      $app_script$($app_module$, $app_exports$, $app_require$);
      if ($app_exports$.__esModule && $app_exports$.default) {
        $app_module$.exports = $app_exports$.default;
      }
    });
    `;
  } else if (appType === DEVICE_LEVEL.LITE) {
    output += `
    var options=$app_script$;
    if ($app_script$.__esModule) {
      options = $app_script$.default;
    }
    module.exports=new ViewModel(options);
    `;
  }

  return output;
}

function getAppScriptAssign(ctx, options: ILoadAppDefineOptions) {
  return `function(module, exports) {
    ${options.code.replace('export default', 'exports.default =')}
    exports.manifest = ${JSON.stringify(options.manifest)};
  }`;
}
