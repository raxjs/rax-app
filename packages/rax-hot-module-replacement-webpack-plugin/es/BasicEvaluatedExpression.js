/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
'use strict';

var BasicEvaluatedExpression =
/*#__PURE__*/
function () {
  function BasicEvaluatedExpression() {
    this.range = null;
  }

  var _proto = BasicEvaluatedExpression.prototype;

  _proto.isNull = function isNull() {
    return !!this.null;
  };

  _proto.isString = function isString() {
    return Object.prototype.hasOwnProperty.call(this, 'string');
  };

  _proto.isNumber = function isNumber() {
    return Object.prototype.hasOwnProperty.call(this, 'number');
  };

  _proto.isBoolean = function isBoolean() {
    return Object.prototype.hasOwnProperty.call(this, 'bool');
  };

  _proto.isRegExp = function isRegExp() {
    return Object.prototype.hasOwnProperty.call(this, 'regExp');
  };

  _proto.isConditional = function isConditional() {
    return Object.prototype.hasOwnProperty.call(this, 'options');
  };

  _proto.isArray = function isArray() {
    return Object.prototype.hasOwnProperty.call(this, 'items');
  };

  _proto.isConstArray = function isConstArray() {
    return Object.prototype.hasOwnProperty.call(this, 'array');
  };

  _proto.isIdentifier = function isIdentifier() {
    return Object.prototype.hasOwnProperty.call(this, 'identifier');
  };

  _proto.isWrapped = function isWrapped() {
    return Object.prototype.hasOwnProperty.call(this, 'prefix') || Object.prototype.hasOwnProperty.call(this, 'postfix');
  };

  _proto.isTemplateString = function isTemplateString() {
    return Object.prototype.hasOwnProperty.call(this, 'quasis');
  };

  _proto.asBool = function asBool() {
    if (this.isBoolean()) return this.bool;else if (this.isNull()) return false;else if (this.isString()) return !!this.string;else if (this.isNumber()) return !!this.number;else if (this.isRegExp()) return true;else if (this.isArray()) return true;else if (this.isConstArray()) return true;else if (this.isWrapped()) return this.prefix && this.prefix.asBool() || this.postfix && this.postfix.asBool() ? true : undefined;else if (this.isTemplateString()) {
      if (this.quasis.length === 1) return this.quasis[0].asBool();

      for (var i = 0; i < this.quasis.length; i++) {
        if (this.quasis[i].asBool()) return true;
      } // can't tell if string will be empty without executing

    }
    return undefined;
  };

  _proto.setString = function setString(str) {
    if (str === null) delete this.string;else this.string = str;
    return this;
  };

  _proto.setNull = function setNull() {
    this.null = true;
    return this;
  };

  _proto.setNumber = function setNumber(num) {
    if (num === null) delete this.number;else this.number = num;
    return this;
  };

  _proto.setBoolean = function setBoolean(bool) {
    if (bool === null) delete this.bool;else this.bool = bool;
    return this;
  };

  _proto.setRegExp = function setRegExp(regExp) {
    if (regExp === null) delete this.regExp;else this.regExp = regExp;
    return this;
  };

  _proto.setIdentifier = function setIdentifier(identifier) {
    if (identifier === null) delete this.identifier;else this.identifier = identifier;
    return this;
  };

  _proto.setWrapped = function setWrapped(prefix, postfix) {
    this.prefix = prefix;
    this.postfix = postfix;
    return this;
  };

  _proto.unsetWrapped = function unsetWrapped() {
    delete this.prefix;
    delete this.postfix;
    return this;
  };

  _proto.setOptions = function setOptions(options) {
    if (options === null) delete this.options;else this.options = options;
    return this;
  };

  _proto.setItems = function setItems(items) {
    if (items === null) delete this.items;else this.items = items;
    return this;
  };

  _proto.setArray = function setArray(array) {
    if (array === null) delete this.array;else this.array = array;
    return this;
  };

  _proto.setTemplateString = function setTemplateString(quasis) {
    if (quasis === null) delete this.quasis;else this.quasis = quasis;
    return this;
  };

  _proto.addOptions = function addOptions(options) {
    var _this = this;

    if (!this.options) this.options = [];
    options.forEach(function (item) {
      _this.options.push(item);
    }, this);
    return this;
  };

  _proto.setRange = function setRange(range) {
    this.range = range;
    return this;
  };

  return BasicEvaluatedExpression;
}();

module.exports = BasicEvaluatedExpression;