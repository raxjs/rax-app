import { getOptions } from 'loader-utils';
import { join, dirname } from 'path';
import { formatPath } from '@builder/app-helpers';

interface ITabBarItem {
  text?: string;
  pageName?: string;
  icon?: string;
  activeIcon?: string;
  path?: string;
  name?: string;
}

interface IRoute {
  path: string;
  source: string;
  lazy?: boolean;
  component?: any;
}

interface IAppConfig {
  routes: IRoute[];
  tabBar: {
    textColor?: string;
    selectedColor?: string;
    backgroundColor?: string;
    items: ITabBarItem[];
  };
}

interface IImportComponentInfo {
  normalImportExpression: string;
  normalImports: IRoute[];
  dynamicImports: IRoute[];
}

export default function (appJSON) {
  const options = getOptions(this) || {};
  const { target, mpa } = options;
  const appConfig: IAppConfig = JSON.parse(appJSON);
  const isRootAppJsonPath = this.resourcePath === join(this.rootContext, 'src', 'app.json');

  if (mpa && isRootAppJsonPath) {
    return `
      const appConfig = ${appJSON};
      export default appConfig;
      `;
  }

  const { normalImportExpression, normalImports, dynamicImports } = getImportComponentInfo.call(this, appConfig, target);
  const { routes, ...otherConfig } = appConfig;
  return `
  import { createElement } from 'rax';
  ${normalImportExpression}
  const staticConfig = ${JSON.stringify(otherConfig)};

  staticConfig.routes = [];

  ${addNormalImportRouteExpression(normalImports)}

  ${addDynamicImportRouteExpression.call(this, dynamicImports)};

  export default staticConfig;
  `;
}

function getImportComponentInfo(appConfig: IAppConfig, target: string): IImportComponentInfo {
  const dynamicImports = [];
  let normalImports = [];
  if (target === 'web') {
    appConfig.routes.forEach((route) => {
      const { lazy = true } = route;
      if (lazy) {
        dynamicImports.push(route);
      } else {
        normalImports.push(route);
      }
    });
  } else {
    normalImports = appConfig.routes;
  }
  const normalImportExpression = normalImports.reduce((curr, next) => {
    // import Home from 'source';
    return `${curr}
    import ${getComponentName(next)} from '${formatPath(join(dirname(this.resourcePath), next.source))}';`;
  }, '');

  return {
    normalImportExpression,
    normalImports,
    dynamicImports,
  };
}

function addDynamicImportRouteExpression(dynamicImports: IRoute[]): string {
  let expression = '';
  dynamicImports.forEach((route) => {
    expression += `staticConfig.routes.push({
      ...${JSON.stringify(route)},
      lazy: true,
      component: import(/* webpackChunkName: "${getComponentName(route).toLowerCase()}.chunk" */ '${formatPath(join(dirname(this.resourcePath), route.source))}')
      .then((mod) => mod.default || mod)
    });`;
  });

  return expression;
}

function addNormalImportRouteExpression(normalImports: IRoute[]): string {
  let expression = '';
  normalImports.forEach((route) => {
    expression += `staticConfig.routes.push({
      ...${JSON.stringify(route)},
      component: (props) => createElement(${getComponentName(route)}, {
        ...props,
        pageConfig: ${JSON.stringify(route)},
      }),
    });`;
  });

  return expression;
}

function getComponentName(route: IRoute): string {
  if (route.path === '/') return 'Index';
  // /about => About
  return `${route.path[1].toUpperCase()}${route.path.substr(2)}`;
}
