const { join } = require('path');
const { existsSync } = require('fs');
const { getOptions } = require('loader-utils');
const { getRouteName } = require('rax-compile-config');
const pathToRegexp = require('path-to-regexp');
const getDepPath = require('./getDepPath');


/**
 * universal-app-config-loader
 * return {
 *  routes: [],
 *  window: {},
 *  type: "web",
 *  withSSR: false,
 *  AppShell: null
 * }
 */
module.exports = function (content) {
  const appJSON = content.replace('module.exports =', '');

  const options = getOptions(this) || {};

  const raxType = options.type; // web、weex、miniapp
  const withSSR = process.env.RAX_SSR === 'true';
  const withAppShell = existsSync(join(this.rootContext, 'src/shell/index.jsx'));

  // Process routes
  const assembleRoutes = JSON.parse(appJSON).routes.map((route, index) => {

    // First level function to support hooks will autorun function type state,
    // Second level function to support rax-use-router rule autorun function type component.
    const dynamicImportComponent =
      `() =>
      import(/* webpackChunkName: "${getRouteName(route, this.rootContext)}" */ '${getDepPath(route.component, this.rootContext)}')
      .then((mod) => () => interopRequire(mod))
    `;
    const importComponent = `() => () => interopRequire(require('${getDepPath(route.component, this.rootContext)}'))`;

    return `routes.push({
      index: ${index},
      regexp: ${pathToRegexp(route.path).toString()},
      path: '${route.path}',
      component: ${raxType === 'web' ? dynamicImportComponent : importComponent}
    });`;
  }).join('\n');


  // return app config
  return `
    ${ withAppShell ? `import Shell from "${getDepPath('shell/index', this.rootContext)}";` : ''}
    const interopRequire = (mod) => mod && mod.__esModule ? mod.default : mod;
    const routes = [];
    ${assembleRoutes}
    export default {
      ...${appJSON},
      type: "${raxType}",
      withSSR: ${withSSR},
      AppShell: ${withAppShell ? 'Shell' : 'null'},
      routes,
    };
  `;
}