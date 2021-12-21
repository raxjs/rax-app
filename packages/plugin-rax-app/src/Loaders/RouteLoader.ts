import { getOptions } from 'loader-utils';
import { join, dirname } from 'path';
import { formatPath } from '@builder/app-helpers';
import { pathHelper } from 'miniapp-builder-shared';
import { MINIAPP_PLATFORMS } from '../constants';

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
  pageSource?: string;
}

interface IStaticConfig {
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
  requireRoutes: IRoute[];
}

export default function (appJSON) {
  const options = getOptions(this) || {};
  const { target, mpa } = options;
  const initialStaticConfig: IStaticConfig = transformAppConfig(appJSON);
  const isRootAppJsonPath = this.resourcePath === join(this.rootContext, 'src', 'app.json');

  const staticConfig = {
    ...initialStaticConfig,
    routes: formatRoutes(initialStaticConfig.routes, {
      target,
      currentSubDir: dirname(this.resourcePath),
      rootContext: this.rootContext,
      isRootAppJsonPath,
    }),
  };

  if (mpa && isRootAppJsonPath) {
    return `
      const appConfig = ${appJSON};
      export default appConfig;
      `;
  }

  const { normalImportExpression, normalImports, dynamicImports, requireRoutes } = getImportComponentInfo.call(
    this,
    staticConfig,
    target,
  );
  const { routes, ...otherConfig } = staticConfig;
  return `
  import { createElement } from 'rax';
  ${normalImportExpression}
  const staticConfig = ${JSON.stringify(otherConfig)};

  staticConfig.routes = [];

  ${addNormalImportRouteExpression(normalImports)}

  ${addDynamicImportRouteExpression.call(this, dynamicImports)};

  ${addRequireRouteExpression.call(this, requireRoutes)}
  export default staticConfig;
  `;
}

function getImportComponentInfo(appConfig: IStaticConfig, target: string): IImportComponentInfo {
  const dynamicImports = [];
  let normalImports = [];
  let requireRoutes = [];
  if (target === 'web') {
    appConfig.routes.forEach((route) => {
      const { lazy = true } = route;
      if (lazy) {
        dynamicImports.push(route);
      } else {
        normalImports.push(route);
      }
    });
  } else if (MINIAPP_PLATFORMS.includes(target)) {
    requireRoutes = appConfig.routes;
  } else {
    normalImports = appConfig.routes;
  }
  const normalImportExpression = normalImports.reduce((curr, next) => {
    // import Home from 'source';
    return `${curr}
    import ${getComponentName(next)} from '${getPagePathByRoute(next, { rootContext: this.rootContext })}';`;
  }, '');

  return {
    normalImportExpression,
    normalImports,
    dynamicImports,
    requireRoutes,
  };
}

function addDynamicImportRouteExpression(dynamicImports: IRoute[]): string {
  let expression = '';
  dynamicImports.forEach((route) => {
    expression += `staticConfig.routes.push({
      ...${JSON.stringify(route)},
      lazy: true,
      component: () => import(/* webpackChunkName: "${getComponentName(route).toLowerCase()}.chunk" */ '${getPagePathByRoute(
  route,
  { rootContext: this.rootContext },
)}')
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
      component: ${getComponentName(route)},
    });`;
  });

  return expression;
}

function addRequireRouteExpression(normalImports: IRoute[]): string {
  let expression = '';
  normalImports.forEach((route) => {
    expression += `staticConfig.routes.push({
      ...${JSON.stringify(route)},
      component: () => require('${getPagePathByRoute(route, { rootContext: this.rootContext })}').default,
    });`;
  });

  return expression;
}

function getComponentName(route: IRoute): string {
  if (!route.path) {
    throw new Error(`There need path field in this route: ${route}`);
  }
  if (route.path === '/') return 'Index';
  // /about => About
  // /list-a => Lista
  return `${route.path[1].toUpperCase()}${route.path.substr(2).replace(/-/, '')}`;
}

function transformAppConfig(jsonContent): IStaticConfig {
  const appConfig = JSON.parse(jsonContent);
  if (appConfig.tabBar?.items) {
    appConfig.tabBar.items = appConfig.tabBar.items.map((item) => {
      const { path, name, text, pageName, ...otherConfigs } = item;
      return {
        ...otherConfigs,
        text: text || name,
        pageName: pageName || path,
      };
    });
  }

  return appConfig;
}

function formatRoutes(routes: IRoute[], { target, currentSubDir, rootContext, isRootAppJsonPath }): IRoute[] {
  return filterByTarget(routes, { target })
    .filter(
      ({ source }) =>
        // Only filter miniapp native page
        !MINIAPP_PLATFORMS.includes(target) || !pathHelper.isNativePage(join(currentSubDir, source), target),
    )
    .map((route) => {
      if (isRootAppJsonPath) return route;
      if (route.pageSource) {
        return {
          ...route,
          source: formatSourcePath(route.pageSource, { rootContext }),
        };
      }
      return {
        ...route,
        source: formatSourcePath(join(currentSubDir, route.source), { rootContext }),
      };
    });
}

function filterByTarget(routes, { target }) {
  return routes.filter(({ targets }) => {
    if (!targets) return true;
    return targets.includes(target);
  });
}

function formatSourcePath(filepath: string, { rootContext }): string {
  return formatPath(filepath).replace(formatPath(`${rootContext}/src/`), '');
}

function getPagePathByRoute({ source, pageSource }: IRoute, { rootContext }): string {
  return formatPath(pageSource || join(rootContext, 'src', source));
}
