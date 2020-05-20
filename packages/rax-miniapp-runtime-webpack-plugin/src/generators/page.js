const ejs = require('ejs');
const lifeCycleMap = require('../nativeLifeCycle');
const { MINIAPP } = require('../constants');
const adapter = require('../adapter');
const getAssetPath = require('../utils/getAssetPath');
const addFileToCompilation = require('../utils/addFileToCompilation');
const adjustCSS = require('../utils/adjustCSS');
const getTemplate = require('../utils/getTemplate');

function generatePageJS(
  compilation,
  assets,
  pageRoute,
  needPullRefresh,
  nativeLifeCycles,
  { target, command, rootDir }
) {
  const configProps = [];
  const events = [];
  Object.keys(nativeLifeCycles).forEach((cycleName) => {
    const cycleConfig = lifeCycleMap[cycleName];
    if (cycleConfig) {
      if (cycleConfig.inEventsProps) {
        events.push(cycleName);
      } else {
        configProps.push(cycleConfig);
      }
    }
  });
  if (needPullRefresh) {
    configProps.push(lifeCycleMap.onPullDownRefresh);
    if (target === MINIAPP) {
      configProps.push(lifeCycleMap.onPullIntercept);
    }
  }
  const pageJsContent = ejs.render(getTemplate(rootDir, target, 'page'), {
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
    define_native_lifecycle: `[${events.reduce((prev, current, index) => {
      const currentCycle = "'" + current + "'";
      if (index === 0) {
        return currentCycle;
      }
      return prev + ',' + currentCycle;
    }, '')}].forEach(eventName => {
  events[eventName] = function(event) {
    if (this.window) {
      this.window.$$trigger(eventName, { event });
    }
  };
});`,
    define_lifecycle_in_config: configProps.reduce((prev, current) => {
      let currentCycle;
      if (current.name === 'onShareAppMessage') {
        currentCycle = `${current.name}(options) {
    if (this.window) {
      const shareInfo = {};
      this.window.$$trigger('onShareAppMessage', {
        event: { options, shareInfo }
      });
      return shareInfo.content;
    }
  },`;
      } else {
        currentCycle = `${current.name}(options) {
    if (this.window) {
      return this.window.$$trigger('${current.name}', {
        event: options
      })
    }
  },`;
      }
      return prev + '\n\t' + currentCycle;
    }, '')
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
  customComponentRoot,
  pageRoute,
  { target, command }
) {
  let pageXmlContent = `<element ${
    adapter[target].directive.if
  }="{{pageId}}" class="{{bodyClass}}" data-private-node-id="e-body" data-private-page-id="{{pageId}}" ${
    customComponentRoot ? 'generic:custom-component="custom-component"' : ''
  }> </element>`;

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
  pageExtraConfig,
  customComponentRoot,
  pageRoute,
  { target, command }
) {
  const pageConfig = {
    ...pageExtraConfig,
    usingComponents: {
      element: 'miniapp-element',
    },
  };
  if (customComponentRoot) {
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
