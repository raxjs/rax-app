const babel = require('@babel/core');
const { getBabelConfig } = require('rax-compile-config');

const babelConfig = getBabelConfig();

module.exports = function() {
  const resourcePath = this.resourcePath.replace(/\\/g, '/'); // Avoid path error in Windows
  const source = `
    import { render, createElement } from 'rax';
    import Component from '${resourcePath}';
    import DriverUniversal from 'driver-universal';

    const comProps = {
      history: window.history,
      location: window.history.location,
      ...window.__pageProps
    };

    function Entry() {
      return createElement(Component, comProps);
    }

    export default function createApp() {
      render(createElement(Entry), null, { driver: DriverUniversal });
    }
  `;

  const { code } = babel.transformSync(source, babelConfig);

  return code;
};
