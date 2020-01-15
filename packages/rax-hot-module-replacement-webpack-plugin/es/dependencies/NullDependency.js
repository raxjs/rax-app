/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



function _defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

const Dependency = require('../Dependency');

const NullDependency =
/* #__PURE__ */
function (_Dependency) {
  _inheritsLoose(NullDependency, _Dependency);

  function NullDependency() {
    return _Dependency.apply(this, arguments) || this;
  }

  const _proto = NullDependency.prototype;

  _proto.isEqualResource = function isEqualResource() {
    return false;
  };

  _proto.updateHash = function updateHash() {};

  _createClass(NullDependency, [{
    key: "type",
    get: function get() {
      return 'null';
    },
  }]);

  return NullDependency;
}(Dependency);

NullDependency.Template =
/* #__PURE__ */
function () {
  function NullDependencyTemplate() {}

  const _proto2 = NullDependencyTemplate.prototype;

  _proto2.apply = function apply() {};

  return NullDependencyTemplate;
}();

module.exports = NullDependency;