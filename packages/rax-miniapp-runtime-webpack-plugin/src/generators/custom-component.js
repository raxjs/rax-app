const { resolve } = require('path');
const { copy } = require('fs-extra');
const addFileToCompilation = require('../utils/addFileToCompilation');
const adapter = require('../adapter');

function generateCustomComponent(
  compilation,
  customComponentRoot,
  customComponents,
  outputPath,
  { target, command, rootDir }
) {
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
      content: `const render = require('miniapp-render')
      Component(render.createCustomComponentConfig())`,
      target,
      command,
    });

    // custom-component/index.xml
    addFileToCompilation(compilation, {
      filename: `custom-component/index.${adapter[target].xml}`,
      content: `<block ${adapter[target].directive.if}="{{__ready}}">
        ${names
    .map((key, index) => {
      const { props = [], events = [] } = customComponents[key];
      return `<${key} ${adapter[target].directive.prefix}:${
        index === 0 ? 'if' : 'elif'
      }="{{r.behavior === '${key}'}}" id="{{id}}" class="{{className}}" style="{{style}}" ${props
        .map((name) => `${name}="{{${name}}}"`)
        .join(' ')} ${events
        .map((name) => `${adapter[target].directive.event}${name}="on${name}"`)
        .join(' ')}><slot/></${key}>`;
    })
    .join('\n')}
      </block>`,
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

module.exports = generateCustomComponent;
