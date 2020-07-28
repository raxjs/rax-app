const babel = require('@babel/core');
const { getBabelConfig } = require('rax-compile-config');

const babelConfig = getBabelConfig();

module.exports = function() {
  const resourcePath = this.resourcePath.replace(/\\/g, '/'); // Avoid path error in Windows
  const source = `
    import { render, createElement, Component } from 'rax';
    import PageComponent from '${resourcePath}';
    import DriverUniversal from 'driver-universal';

    const comProps = {
      history: window.history,
      location: window.history.location,
      ...window.__pageProps
    };

    class Entry extends Component {
      render() {
        return createElement(PageComponent, comProps);
      }
    }

    export default function createApp() {
      const instance = render(<Entry />, null, { driver: DriverUniversal });
      return {
        unmount: instance._internal.unmountComponent.bind(instance._internal)
      }
    }
  `;
  const { code } = babel.transformSync(source, babelConfig);

  return code;
};
