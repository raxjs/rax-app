const ejs = require('ejs');
const adapter = require('../adapter');
const getAssetPath = require('../utils/getAssetPath');
const addFileToCompilation = require('../utils/addFileToCompilation');
const adjustCSS = require('../utils/adjustCSS');
const getTemplate = require('../utils/getTemplate');
const { MINIAPP } = require('../constants');

function generatePageJS(
  compilation,
  assets,
  pageRoute,
  nativeLifeCycles,
  { target, command, rootDir }
) {
  const pageJsContent = ejs.render(getTemplate(rootDir, 'page.js'), {
    config_path: `${getAssetPath('config.js', `${pageRoute}.js`)}`,
    init: `function init(window, document) {${assets.js
      .map(
        (js) =>
          `require('${getAssetPath(
            js,
            `${pageRoute}.js`
          )}')(window, document)`
      )
      .join(';')}}`,
    native_lifecycles: `[${Object.keys(nativeLifeCycles).reduce((total, current) => `${total}'${current}'`, '')}]`
  });

  addFileToCompilation(compilation, {
    filename: `${pageRoute}.js`,
    content: pageJsContent,
    target,
    command,
  });
}

function generatePageXML(
  compilation,
  pageRoute,
  useNativeComponent,
  { target, command, rootDir }
) {
  let pageXmlContent = `<view class="miniprogram-root" data-private-node-id="e-body" data-private-page-id="{{pageId}}">
    <template is="element" data="{{r: root.children[0]}}"  />
  </view>`;

  if (target === MINIAPP && useNativeComponent) {
    pageXmlContent = ejs.render(getTemplate(rootDir, 'root.xml', target)) + pageXmlContent;
  } else {
    pageXmlContent = `<import src="../../root.${adapter[target].xml}"/>` + pageXmlContent;
  }

  addFileToCompilation(compilation, {
    filename: `${pageRoute}.${adapter[target].xml}`,
    content: pageXmlContent,
    target,
    command,
  });
}

function generatePageCSS(compilation, assets, pageRoute, { target, command }) {
  const pageCssContent = assets.css
    .map(
      (css) =>
        `@import "${getAssetPath(css, `${pageRoute}.${adapter[target].css}`)}";`
    )
    .join('\n');

  addFileToCompilation(compilation, {
    filename: `${pageRoute}.${adapter[target].css}`,
    content: adjustCSS(pageCssContent),
    target,
    command,
  });
}

function generatePageJSON(
  compilation,
  pageConfig,
  useNativeComponent,
  pageRoute,
  { target, command }
) {
  if (target !== MINIAPP) {
    pageConfig.usingComponents = {
      'element': '../../comp'
    };
  }
  if (useNativeComponent) {
    if (!pageConfig.usingComponents) {
      pageConfig.usingComponents = {};
    }
    pageConfig.usingComponents['custom-component'] = getAssetPath(
      'custom-component/index',
      `${pageRoute}.js`
    );
  }
  addFileToCompilation(compilation, {
    filename: `${pageRoute}.json`,
    content: JSON.stringify(pageConfig, null, 2),
    target,
    command,
  });
}

module.exports = {
  generatePageCSS,
  generatePageJS,
  generatePageJSON,
  generatePageXML
};
