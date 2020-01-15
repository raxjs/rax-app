/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
'use strict';

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var ModuleDependency = require('./ModuleDependency');

var ModuleDependencyTemplateAsId = require('./ModuleDependencyTemplateAsId');

var ModuleHotAcceptDependency =
/*#__PURE__*/
function (_ModuleDependency) {
  _inheritsLoose(ModuleHotAcceptDependency, _ModuleDependency);

  function ModuleHotAcceptDependency(request, range) {
    var _this;

    _this = _ModuleDependency.call(this, request) || this;
    _this.range = range;
    _this.weak = true;
    return _this;
  }

  _createClass(ModuleHotAcceptDependency, [{
    key: "type",
    get: function get() {
      return 'module.hot.accept';
    }
  }]);

  return ModuleHotAcceptDependency;
}(ModuleDependency);

ModuleHotAcceptDependency.Template = ModuleDependencyTemplateAsId;
module.exports = ModuleHotAcceptDependency;