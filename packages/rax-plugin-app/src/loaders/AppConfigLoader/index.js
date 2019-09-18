const { getRouteName } = require('rax-compile-config');
const { getOptions } = require('loader-utils');
const getDepPath = require('./getDepPath');

/**
 * universal-app-config-loader
 * return {
 *  "routes": [
      {
        "path": "/",
        "source": "pages/Home/index",
        "component": fn,
      }
    ],
    "shell": {
      "source": "shell/index",
      "component": fn
    },
    "hydrate": false  
  }
 */
module.exports = function (appJSON) {
  const options = getOptions(this) || {};
  const { type } = options;
  const appConfig = JSON.parse(appJSON);

  const assembleRoutes = appConfig.routes.map((route) => {
    // First level function to support hooks will autorun function type state,
    // Second level function to support rax-use-router rule autorun function type component.
    const dynamicImportComponent =
      `() =>
      import(/* webpackChunkName: "${getRouteName(route, this.rootContext)}" */ '${getDepPath(route.source, this.rootContext)}')
      .then((mod) => () => interopRequire(mod))
    `;
    const importComponent = `() => () => interopRequire(require('${getDepPath(route.source, this.rootContext)}'))`;

    return `routes.push({
      path: '${route.path}',
      source: '${route.source}',
      component: ${type === 'web' ? dynamicImportComponent : importComponent}
    });`;
  }).join('\n');

  let processShell;
  if (appConfig.shell) {
    processShell = `
    import Shell from "${getDepPath(appConfig.shell.source, this.rootContext)}";
    appConfig.shell = {
      source: '${appConfig.shell.source}',
      component: Shell
    };
    `;
  } else {
    processShell = '';
  }

  return `
    const interopRequire = (mod) => mod && mod.__esModule ? mod.default : mod;
    const routes = [];
    ${assembleRoutes}
    const appConfig = {
      ...${appJSON},
      routes
    };
    ${processShell}
    export default appConfig;
  `;
}