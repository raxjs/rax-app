const t = require('@babel/types');
const babelParser = require('@babel/parser');
const invokeModules = require('../utils/invokeModules');
const traverse = require('../utils/traverseNodePath');
const parserOption = require('./option');

const RELATIVE_COMPONENTS_REG = /^\..*(\.j|tsx?)?$/i;


/**
 * Parse JS code by babel parser.
 * @param code {String} JS code.
 */
function parseCode(code) {
  return babelParser.parse(code, parserOption);
}

/**
 * Get imported modules.
 * @param ast
 */
function getImported(ast) {
  // { [source]: [{ local: String, imported: String, default: Boolean } }]
  const imported = {};
  traverse(ast, {
    ImportDeclaration(path) {
      const { specifiers } = path.node;
      if (!Array.isArray(specifiers)) return;
      const source = path.node.source.value;
      imported[source] = [];

      path.node.specifiers.forEach((specifier) => {
        const local = specifier.local.name;
        const ret = { local, default: t.isImportDefaultSpecifier(specifier), namespace: t.isImportNamespaceSpecifier(specifier) };
        if (ret.default === false && ret.namespace === false) {
          ret.importFrom = specifier.imported.name;
        }

        if (RELATIVE_COMPONENTS_REG.test(source)) {
          ret.isCustomEl = true;
        } else {
          ret.isCustomEl = false;
        }
        imported[source].push(ret);
      });
    },
  });
  return imported;
}

/**
 * @param code
 * @param options {Object} Parser plugins.
 */
function parse(code, options) {
  const ast = parseCode(code);
  const imported = getImported(ast);

  const ret = {
    ast,
    imported
  };

  // Reverse to call parse.
  invokeModules(reverse(options.plugins), 'parse', ret, code, options);
  return ret;
}

function parseExpression(code) {
  return parseCode(code).program.body[0].expression;
}

/**
 * Reverse an array without effects.
 */
function reverse(arr) {
  const copied = Array.prototype.slice.call(arr);
  return copied.reverse();
}

exports.parse = parse;
exports.parseCode = parseCode;
exports.parseExpression = parseExpression;
exports.getImported = getImported;
