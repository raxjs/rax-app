const VirtualModulesPlugin = require('webpack-virtual-modules');
const { join } = require('path');

function getVirtualModules(routes, { rootDir }) {
  const result = new Map();
  routes.forEach((route) => {
    const virtualPath = join(rootDir, 'src', route.source);
    result.set(`${route.source}.bundle`, new VirtualModulesPlugin({
      [`${virtualPath}.bundle`]: `import { createElement, render } from 'rax';
      import DriverUniversal from 'driver-universal';
      import PageComponent from '${virtualPath}';
      function Component(props) {
        return createElement(PageComponent, { pageConfig: ${JSON.stringify(route)}, ...props })
      }
      if (window.__pagesRenderInfo) {
        window.__pagesRenderInfo.push({
          path: '${route.source}',
          component: Component,
          setDocument: window.__setDocument || value => document = value
        });
      } else {
        window.__pagesRenderInfo = [{
          path: '${route.source}',
          component: Component,
          setDocument: window.__setDocument || value => document = value
        }];
        window.__render = function (pageComponent) {
          const rootEl = document.createElement('div');
          rootEl.setAttribute('id', 'root');
          const pageInstance = render(createElement(pageComponent, {
            history,
            location: history.location,
            ...pageProps,
          }), rootEl, {
            driver: DriverUniversal
          });

          document.body.appendChild(rootEl);
          document.__unmount = function() {
            return pageInstance._internal.unmountComponent.bind(pageInstance._internal);
          }
        };
      }
` }));
  });

  return result;
}


module.exports = getVirtualModules;
