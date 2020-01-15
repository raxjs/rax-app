/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



const compareLocations = require('./compareLocations');

const Dependency =
/* #__PURE__ */
function () {
  function Dependency() {
    this.module = null;
  }

  const _proto = Dependency.prototype;

  _proto.isEqualResource = function isEqualResource() {
    return false;
  } // Returns the referenced module and export
  ;

  _proto.getReference = function getReference() {
    if (!this.module) return null;
    return {
      module: this.module,
      importedNames: true, // true: full object, false: only sideeffects/no export, array of strings: the exports with this names

    };
  } // Returns the exported names
  ;

  _proto.getExports = function getExports() {
    return null;
  };

  _proto.getWarnings = function getWarnings() {
    return null;
  };

  _proto.getErrors = function getErrors() {
    return null;
  };

  _proto.updateHash = function updateHash(hash) {
    hash.update(`${this.module && this.module.id  }`);
  };

  _proto.disconnect = function disconnect() {
    this.module = null;
  } // TODO: remove in webpack 3
  ;

  _proto.compare = function compare(a, b) {
    return compareLocations(a.loc, b.loc);
  };

  return Dependency;
}();

Dependency.compare = function (a, b) {
  return compareLocations(a.loc, b.loc);
};

module.exports = Dependency;