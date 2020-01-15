/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
'use strict';

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var WebpackError = require('./WebpackError');

var UnsupportedFeatureWarning =
/*#__PURE__*/
function (_WebpackError) {
  _inheritsLoose(UnsupportedFeatureWarning, _WebpackError);

  function UnsupportedFeatureWarning(module, message) {
    var _this;

    _this = _WebpackError.call(this) || this;
    _this.name = 'UnsupportedFeatureWarning';
    _this.message = message;
    _this.origin = _this.module = module;
    Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor);
    return _this;
  }

  return UnsupportedFeatureWarning;
}(WebpackError);

module.exports = UnsupportedFeatureWarning;