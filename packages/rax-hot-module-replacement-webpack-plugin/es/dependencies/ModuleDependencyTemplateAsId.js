/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
'use strict';

var ModuleDependencyTemplateAsId =
/*#__PURE__*/
function () {
  function ModuleDependencyTemplateAsId() {}

  var _proto = ModuleDependencyTemplateAsId.prototype;

  _proto.apply = function apply(dep, source, outputOptions, requestShortener) {
    if (!dep.range) return;
    var comment = outputOptions.pathinfo ? "/*! " + requestShortener.shorten(dep.request) + " */ " : '';
    var content;
    if (dep.module) content = comment + JSON.stringify(dep.module.id);else content = require('./WebpackMissingModule').module(dep.request);
    source.replace(dep.range[0], dep.range[1] - 1, content);
  };

  return ModuleDependencyTemplateAsId;
}();

module.exports = ModuleDependencyTemplateAsId;