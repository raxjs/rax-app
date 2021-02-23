export default function () {
  return `
    import { createElement } from 'rax';
    import Page from '${this.resourcePath}';
    import renderer from 'rax-server-renderer';

    function renderPage() {
      return renderer.renderToString(createElement(Page), {
        defaultUnit: 'rpx'
      });
    }

    export {
      renderPage
    };
  `;
}
