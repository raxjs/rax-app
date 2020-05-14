const { resolve } = require('path');
const { copy } = require('fs-extra');
const addFileToCompilation = require('../utils/addFileToCompilation');
const adapter = require('../adapter');
const getTemplate = require('../utils/getTemplate');

module.exports = function(
  compilation,
  customComponentRoot,
  customComponents,
  outputPath,
  { target, command, rootDir }
) {
  const customComponentJsTmpl = getTemplate(rootDir, target, 'custom-component');
  if (customComponentRoot) {
    copy(
      customComponentRoot,
      resolve(outputPath, 'custom-component/components'),
      {
        dereference: true
      }
    );

    const realUsingComponents = {};
    const names = Object.keys(customComponents);
    names.forEach(
      (key) =>
        realUsingComponents[
          key
        ] = `./components/${customComponents[key].path}`
    );

    // custom-component/index.js
    addFileToCompilation(compilation, {
      filename: 'custom-component/index.js',
      content: customComponentJsTmpl,
      target,
      command,
    });

    // custom-component/index.xml
    addFileToCompilation(compilation, {
      filename: `custom-component/index.${adapter[target].xml}`,
      content: names
        .map((key, index) => {
          const { props = [], events = [] } = customComponents[key];
          return `<${key} ${adapter[target].directive.prefix}:${
            index === 0 ? 'if' : 'elif'
          }="{{name === '${key}'}}" id="{{id}}" class="{{className}}" style="{{style}}" ${props
            .map((name) => `${name}="{{${name}}}"`)
            .join(' ')} ${events
            .map((name) => `${adapter[target].directive.event}${name}="on${name}"`)
            .join(' ')}><slot/></${key}>`;
        })
        .join('\n'),
      target,
      command,
    });

    // custom-component/index.css
    addFileToCompilation(compilation, {
      filename: `custom-component/index.${adapter[target].css}`,
      content: '',
      target,
      command,
    });

    // custom-component/index.json
    addFileToCompilation(compilation, {
      filename: 'custom-component/index.json',
      content: JSON.stringify(
        {
          component: true,
          usingComponents: realUsingComponents,
        },
        null,
        '\t'
      ),
      target,
      command,
    });
  }
};
