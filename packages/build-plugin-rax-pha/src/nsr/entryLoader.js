const qs = require('qs');
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { getBabelConfig } = require('rax-compile-config');

const babelConfig = getBabelConfig();

const isWin = process.platform === 'win32';

/**
 * Transform Windows-style paths, such as 'C:\Windows\system32' to 'C:/Windows/system32'.
 * Because 'C:\Windows\system32' will be escaped to 'C:Windowssystem32'
 * @param {*} p
 */
const formatPath = (p) => {
  return isWin ? p.split(path.sep).join('/') : p;
};

module.exports = function() {
  const query = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;
  const {
    absoluteShellPath,
    pagePath,
  } = query;

  const absolutePagePath = formatPath(this.resourcePath);
  const hasShell = fs.existsSync(absoluteShellPath);
  const shellStr = hasShell ? `import Shell from '${formatPath(absoluteShellPath)}'` : 'const Shell = function (props) { return props.children };';

  const renderHtmlFnc = `
    async function renderComponentToHTML(Component, pageData) {
      const initialData = {
        shellData: {},
        pageData,
        pagePath: '${pagePath}'
      };

      const contentElement = createElement(Shell, {}, createElement(Component, pageData));

      const html = renderer.renderToString(contentElement, {
        defaultUnit: 'rpx'
      });

      return html;
    }
  `;

  // __get_page_data__: prefetch data callback
  // __nsr_html_callback__: html callback to native
  const source = `
    import { createElement } from 'rax';
    import renderer from 'rax-server-renderer';

    import Page from '${formatPath(absolutePagePath)}';
    ${shellStr}

    ${renderHtmlFnc}

    __get_page_data__(async (data) => {
      const html = await renderComponentToHTML(Page, data);
      __nsr_html_callback__(html);
    });
  `;

  const { code } = babel.transformSync(source, babelConfig);

  return code;
};
