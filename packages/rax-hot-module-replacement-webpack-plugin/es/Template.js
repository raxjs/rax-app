/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

const Tapable = require('tapable');

const ConcatSource = require('webpack-sources').ConcatSource;

const START_LOWERCASE_ALPHABET_CODE = 'a'.charCodeAt(0);
const START_UPPERCASE_ALPHABET_CODE = 'A'.charCodeAt(0);
const DELTA_A_TO_Z = 'z'.charCodeAt(0) - START_LOWERCASE_ALPHABET_CODE + 1;

module.exports =
/* #__PURE__ */
function (_Tapable) {
  _inheritsLoose(Template, _Tapable);

  function Template(outputOptions) {
    let _this;

    _this = _Tapable.call(this) || this;
    _this.outputOptions = outputOptions || {};
    return _this;
  }

  Template.getFunctionContent = function getFunctionContent(fn) {
    return fn.toString().replace(/^function\s?\(\)\s?\{\n?|\n?\}$/g, '').replace(/^\t/mg, '');
  };

  Template.toIdentifier = function toIdentifier(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/^[^a-zA-Z$_]/, '_').replace(/[^a-zA-Z0-9$_]/g, '_');
  };

  Template.toPath = function toPath(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9_!§$()=\-\^°]+/g, '-').replace(/^-|-$/, '');
  } // map number to a single character a-z, A-Z or <_ + number> if number is too big
  ;

  Template.numberToIdentifer = function numberToIdentifer(n) {
    // lower case
    if (n < DELTA_A_TO_Z) return String.fromCharCode(START_LOWERCASE_ALPHABET_CODE + n); // upper case

    n -= DELTA_A_TO_Z;
    if (n < DELTA_A_TO_Z) return String.fromCharCode(START_UPPERCASE_ALPHABET_CODE + n); // fall back to _ + number

    n -= DELTA_A_TO_Z;
    return `_${  n}`;
  };

  const _proto = Template.prototype;

  _proto.indent = function indent(str) {
    if (Array.isArray(str)) {
      return str.map(this.indent.bind(this)).join('\n');
    } else {
      str = str.trimRight();
      if (!str) return '';
      const ind = str[0] === '\n' ? '' : '\t';
      return ind + str.replace(/\n([^\n])/g, '\n\t$1');
    }
  };

  _proto.prefix = function prefix(str, _prefix) {
    if (Array.isArray(str)) {
      str = str.join('\n');
    }

    str = str.trim();
    if (!str) return '';
    const ind = str[0] === '\n' ? '' : _prefix;
    return ind + str.replace(/\n([^\n])/g, `\n${  _prefix  }$1`);
  };

  _proto.asString = function asString(str) {
    if (Array.isArray(str)) {
      return str.join('\n');
    }

    return str;
  };

  _proto.getModulesArrayBounds = function getModulesArrayBounds(modules) {
    if (!modules.every(moduleIdIsNumber)) return false;
    let maxId = -Infinity;
    let minId = Infinity;
    modules.forEach(function (module) {
      if (maxId < module.id) maxId = module.id;
      if (minId > module.id) minId = module.id;
    });

    if (minId < 16 + (`${  minId}`).length) {
      // add minId x ',' instead of 'Array(minId).concat(...)'
      minId = 0;
    }

    const objectOverhead = modules.map(function (module) {
      const idLength = (`${module.id  }`).length;
      return idLength + 2;
    }).reduce(function (a, b) {
      return a + b;
    }, -1);
    const arrayOverhead = minId === 0 ? maxId : 16 + (`${  minId}`).length + maxId;
    return arrayOverhead < objectOverhead ? [minId, maxId] : false;
  };

  _proto.renderChunkModules = function renderChunkModules(chunk, moduleTemplate, dependencyTemplates, prefix) {
    if (!prefix) prefix = '';
    const source = new ConcatSource();

    if (chunk.modules.length === 0) {
      source.add('[]');
      return source;
    }

    const removedModules = chunk.removedModules;
    const allModules = chunk.modules.map(function (module) {
      return {
        id: module.id,
        source: moduleTemplate.render(module, dependencyTemplates, chunk),
      };
    });

    if (removedModules && removedModules.length > 0) {
      removedModules.forEach(function (id) {
        allModules.push({
          id,
          source: 'false',
        });
      });
    }

    const bounds = this.getModulesArrayBounds(chunk.modules);

    if (bounds) {
      // Render a spare array
      const minId = bounds[0];
      const maxId = bounds[1];
      if (minId !== 0) source.add(`Array(${  minId  }).concat(`);
      source.add('[\n');
      const modules = {};
      allModules.forEach(function (module) {
        modules[module.id] = module;
      });

      for (let idx = minId; idx <= maxId; idx++) {
        const module = modules[idx];
        if (idx !== minId) source.add(',\n');
        source.add(`/* ${  idx  } */`);

        if (module) {
          source.add('\n');
          source.add(module.source);
        }
      }

      source.add(`\n${  prefix  }]`);
      if (minId !== 0) source.add(')');
    } else {
      // Render an object
      source.add('{\n');
      allModules.sort(function (a, b) {
        const aId = `${a.id  }`;
        const bId = `${b.id  }`;
        if (aId < bId) return -1;
        if (aId > bId) return 1;
        return 0;
      }).forEach(function (module, idx) {
        if (idx !== 0) source.add(',\n');
        source.add(`\n/***/ ${  JSON.stringify(module.id)  }:\n`);
        source.add(module.source);
      });
      source.add(`\n\n${  prefix  }}`);
    }

    return source;
  };

  return Template;
}(Tapable);

function moduleIdIsNumber(module) {
  return typeof module.id === 'number';
}