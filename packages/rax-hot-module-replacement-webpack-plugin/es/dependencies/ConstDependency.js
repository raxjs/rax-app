/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var NullDependency = require('./NullDependency');

var ConstDependency =
/*#__PURE__*/
function (_NullDependency) {
  _inheritsLoose(ConstDependency, _NullDependency);

  function ConstDependency(expression, range) {
    var _this;

    _this = _NullDependency.call(this) || this;
    _this.expression = expression;
    _this.range = range;
    return _this;
  }

  var _proto = ConstDependency.prototype;

  _proto.updateHash = function updateHash(hash) {
    hash.update(this.range + '');
    hash.update(this.expression + '');
  };

  return ConstDependency;
}(NullDependency);

ConstDependency.Template =
/*#__PURE__*/
function () {
  function ConstDependencyTemplate() {}

  var _proto2 = ConstDependencyTemplate.prototype;

  _proto2.apply = function apply(dep, source) {
    if (typeof dep.range === 'number') {
      source.insert(dep.range, dep.expression);
      return;
    }

    source.replace(dep.range[0], dep.range[1] - 1, dep.expression);
  };

  return ConstDependencyTemplate;
}();

module.exports = ConstDependency;