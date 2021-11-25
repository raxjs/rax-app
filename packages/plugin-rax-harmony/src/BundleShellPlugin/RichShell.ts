import getPageName from '../utils/getPageName';
import BaseShell from './Shell';

const requireModuleMethod = `
function requireModule(moduleName) {
  const systemList = ['system.router', 'system.app', 'system.prompt', 'system.configuration',
  'system.image', 'system.device', 'system.mediaquery', 'ohos.animator', 'system.grid', 'system.resource']
  var target = ''
  if (systemList.includes(moduleName.replace('@', ''))) {
    target = $app_require$('@app-module/' + moduleName.substring(1));
    return target;
  }
  var shortName = moduleName.replace(/@[^.]+\.([^.]+)/, '$1');
  target = requireNapi(shortName);
  if (target !== 'undefined' && /@ohos/.test(moduleName)) {
    return target;
  }
  if (typeof ohosplugin !== 'undefined' && /@ohos/.test(moduleName)) {
    target = ohosplugin;
    for (let key of shortName.split('.')) {
      target = target[key];
      if(!target) {
        break;
      }
    }
    if (typeof target !== 'undefined') {
      return target;
    }
  }
  if (typeof systemplugin !== 'undefined') {
    target = systemplugin;
    for (let key of shortName.split('.')) {
      target = target[key];
      if(!target) {
        break;
      }
    }
    if (typeof target !== 'undefined') {
      return target;
    }
  }
  return target;
}
`;

export default class RichShell extends BaseShell {
  generateApp() {
    return `
    $app_define$('@app-application/app', [], function($app_require$, $app_exports$, $app_module$) {
      ${requireModuleMethod}

      ${this.content};

      $app_exports$.default = result.default;
      $app_exports$.manifest = ${JSON.stringify(this.pluginOptions.manifest)};
      $app_module$.exports = $app_exports$.default;
    });

    $app_bootstrap$('@app-application/app', undefined, undefined);
    `;
  }

  generatePage() {
    const pageName = getPageName(this.options.filename);
    return `
    $app_define$('@app-component/${pageName}', [], function($app_require$, $app_exports$, $app_module$) {
      ${requireModuleMethod}

      $app_exports$.default = {
        onReady() {
          var document = this.app.doc;
          document.body.__rendered = true;
          ${this.content}
        }
      };

      $app_module$.exports = $app_exports$.default;

      $app_module$.exports.template = {
        type: 'div',
        children: [],
      };

      $app_module$.exports.style = {};
    });

    $app_bootstrap$('@app-component/${pageName}', undefined, undefined);
    `;
  }
}
