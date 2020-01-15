import cons from 'consolidate';
import path from 'path';
import loaderUtils from 'loader-utils';
import { transform } from 'babel-core';
import HTMLToJSX from './HTMLToJSX';
import getBabelConfig from './getBabelConfig';

const converter = new HTMLToJSX();

module.exports = function (source, parseObject) {
  this.cacheable && this.cacheable();
  const callback = this.async();
  const query = loaderUtils.parseQuery(this.query); // no engine default: html

  if (!cons[query.engine]) {
    return callback(null, getConvertText(source, parseObject.importLinks, query));
  }

  cons[query.engine].render(source, {
    filename: this.resourcePath,
  }, function (error, html) {
    return callback(error, getConvertText(html, parseObject.importLinks, query));
  });
};

var getConvertText = function getConvertText(source, links, query) {
  const convert = converter.convert(source);
  const presets = query.presets;
  const imports = query.imports;
  const code = `\n    ${  query.banner  }\n    ${  getElementsImport(links)  }\n\n    module.exports = function(styles) {\n      const props = this.props;\n      return ${  convert.output  };\n    };\n  `;
  return transform(code, getBabelConfig(query)).code;
};

var getElementsImport = function getElementsImport(links) {
  let result = '';
  links.forEach(function (link) {
    const ext = path.extname(link);
    const name = path.basename(link, ext);
    result += `import ${  name  } from '${  link  }';\n`;
  });
  return result;
};