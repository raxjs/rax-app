import loaderUtils from 'loader-utils';
import path from 'path';
import { transform } from 'babel-core';
import uppercamelcase from 'uppercamelcase';
import parser from './parserHTML';
import pkg from '../package.json';
import getBabelConfig from './getBabelConfig';

module.exports = function (source) {
  this.cacheable();
  const context = this;
  const filePath = this.resourcePath;
  const fileBaseName = path.basename(filePath, path.extname(filePath));
  const query = loaderUtils.parseQuery(this.query);
  const parseObject = parser(source);
  let output = '\nlet styles = {};\n';
  const componentName = uppercamelcase(fileBaseName); // parse template

  const template = parseObject.template;

  if (template) {
    output += `let template = ${  getCodeString('template', template, filePath)  };\n`;
  } // parse script


  const script = parseObject.script;

  if (script) {
    output += `let ${  componentName  } = ${  getCodeString('script', script, filePath)  };\n`;
    output += `${componentName  } = ${  componentName  }.__esModule ? ${  componentName  }.default : ${  componentName  };\n`;
  } // parse link stylesheet


  const styleSheetLinks = parseObject.styleSheetLinks;

  if (styleSheetLinks.length) {
    styleSheetLinks.forEach(function (link) {
      output += `styles = Object.assign(styles, require('!!stylesheet-loader!${  link  }'));\n`;
    });
  } // parse style


  const styles = parseObject.styles;

  if (styles) {
    output += `styles = Object.assign(styles, ${  getCodeString('style', styles[0], filePath)  });\n`;
  }

  function getCodeString(type, data, path) {
    let loaderString = '';

    switch (type) {
      case 'template':
        loaderString = `${pkg.name  }/lib/template-loader?${  JSON.stringify(query)  }!${  pkg.name  }/lib/node-loader?type=template&index=0!`;
        break;

      case 'style':
        loaderString = `stylesheet-loader!${  pkg.name  }/lib/node-loader?type=styles&index=0!`;
        break;

      case 'script':
        loaderString = `babel-loader?${  JSON.stringify(getBabelConfig(query))  }!${  pkg.name  }/lib/node-loader?${  JSON.stringify({
          type: 'script',
          index: 0,
          banner: query.banner,
        })  }!`;
        break;
    }

    return `require(${  loaderUtils.stringifyRequest(context, `!!${  loaderString  }${path}`)  })`;
  }

  output += `\nif (${  componentName  } && typeof ${  componentName  } === 'function') {\n  ${  componentName  }.prototype.render = function() {\n    return template.call(this, styles);\n  }\n}\n\nmodule.exports = ${  componentName  };\n  `;
  return output;
};