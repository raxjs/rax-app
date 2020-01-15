/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

const Dependency = require('../Dependency');

const ModuleDependency =
/* #__PURE__ */
function (_Dependency) {
  _inheritsLoose(ModuleDependency, _Dependency);

  function ModuleDependency(request) {
    let _this;

    _this = _Dependency.call(this) || this;
    _this.request = request;
    _this.userRequest = request;
    return _this;
  }

  const _proto = ModuleDependency.prototype;

  _proto.isEqualResource = function isEqualResource(other) {
    if (!(other instanceof ModuleDependency)) return false;
    return this.request === other.request;
  };

  return ModuleDependency;
}(Dependency);

module.exports = ModuleDependency;