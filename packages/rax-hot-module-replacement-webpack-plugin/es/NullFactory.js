/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
'use strict';

var NullFactory =
/*#__PURE__*/
function () {
  function NullFactory() {}

  var _proto = NullFactory.prototype;

  _proto.create = function create(data, callback) {
    return callback();
  };

  return NullFactory;
}();

module.exports = NullFactory;