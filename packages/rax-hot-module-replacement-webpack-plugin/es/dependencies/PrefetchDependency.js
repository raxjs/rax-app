/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



function _defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

const ModuleDependency = require('./ModuleDependency');

const PrefetchDependency =
/* #__PURE__ */
function (_ModuleDependency) {
  _inheritsLoose(PrefetchDependency, _ModuleDependency);

  function PrefetchDependency(request) {
    return _ModuleDependency.call(this, request) || this;
  }

  _createClass(PrefetchDependency, [{
    key: "type",
    get: function get() {
      return 'prefetch';
    },
  }]);

  return PrefetchDependency;
}(ModuleDependency);

module.exports = PrefetchDependency;