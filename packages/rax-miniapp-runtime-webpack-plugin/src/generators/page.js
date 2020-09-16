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
  nativeLifeCycles = {},
  { target, command, rootDir }
) {
  const pageJsContent = ejs.render(getTemplate(rootDir, 'page.js'), {
    render_path: `${getAssetPath('render.js', `${pageRoute}.js`)}`,
    route: pageRoute,
    native_lifecycles: `[${Object.keys(nativeLifeCycles).reduce((total, current, index) =>
      index === 0 ? `${total}'${current}'` : `${total},'${current}'`, '')}]`
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
  useComponent,
  { target, command, rootDir }
) {
  let pageXmlContent;
  if (target === MINIAPP && useComponent) {
    pageXmlContent = '<element r="{{root}}"  />';
  } else {
    pageXmlContent = `<import src="${getAssetPath('root.' + adapter[target].xml, pageRoute + adapter[target].xml)}"/>
    <template is="element" data="{{r: root}}"  />`;
  }

  addFileToCompilation(compilation, {
    filename: `${pageRoute}.${adapter[target].xml}`,
    content: pageXmlContent,
    target,
    command,
  });
}

function generatePageJSON(
  compilation,
  pageConfig,
  useComponent,
  pageRoute,
  { target, command }
) {
  if (!pageConfig.usingComponents) {
    pageConfig.usingComponents = {};
  }
  const elementPath = getAssetPath(
    'comp',
    `${pageRoute}.js`
  );
  if (useComponent || target !== MINIAPP) {
    pageConfig.usingComponents.element = elementPath;
  }

  addFileToCompilation(compilation, {
    filename: `${pageRoute}.json`,
    content: JSON.stringify(pageConfig, null, 2),
    target,
    command,
  });
}

module.exports = {
  generatePageJS,
  generatePageJSON,
  generatePageXML
};
