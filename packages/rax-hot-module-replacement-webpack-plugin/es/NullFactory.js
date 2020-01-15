/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



const NullFactory =
/* #__PURE__ */
function () {
  function NullFactory() {}

  const _proto = NullFactory.prototype;

  _proto.create = function create(data, callback) {
    return callback();
  };

  return NullFactory;
}();

module.exports = NullFactory;