import cons from 'consolidate';
import path from 'path';
import loaderUtils from 'loader-utils';
import HTMLToJSX from './HTMLToJSX';
import { transform } from 'babel-core';
import getBabelConfig from './getBabelConfig';
var converter = new HTMLToJSX();

module.exports = function (source, parseObject) {
  this.cacheable && this.cacheable();
  var callback = this.async();
  var query = loaderUtils.parseQuery(this.query); // no engine default: html

  if (!cons[query.engine]) {
    return callback(null, getConvertText(source, parseObject.importLinks, query));
  }

  cons[query.engine].render(source, {
    filename: this.resourcePath
  }, function (error, html) {
    return callback(error, getConvertText(html, parseObject.importLinks, query));
  });
};

var getConvertText = function getConvertText(source, links, query) {
  var convert = converter.convert(source);
  var presets = query.presets,
      imports = query.imports;
  var code = "\n    " + query.banner + "\n    " + getElementsImport(links) + "\n\n    module.exports = function(styles) {\n      const props = this.props;\n      return " + convert.output + ";\n    };\n  ";
  return transform(code, getBabelConfig(query)).code;
};

var getElementsImport = function getElementsImport(links) {
  var result = '';
  links.forEach(function (link) {
    var ext = path.extname(link);
    var name = path.basename(link, ext);
    result += "import " + name + " from '" + link + "';\n";
  });
  return result;
};