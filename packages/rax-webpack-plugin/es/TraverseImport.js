import * as babylon from 'babylon';
import traverse from 'babel-traverse';
import * as types from 'babel-types';
import generate from 'babel-generator';
import codeFrame from 'babel-code-frame';
/* eslint-disable new-cap */

export default function traverseImport(options, inputSource, sourceMapOption) {
  var specified; // Collector import specifiers

  var hasPlatformSpecified = false;
  var platformMap = {
    weex: 'isWeex',
    web: 'isWeb',
    node: 'isNode',
    reactnative: 'isReactNative'
  };
  /**
   * generator variable expression
   *
   * @param  {string} name  identifier
   * @param  {boolean} value
   * @return {VariableDeclaration}
   * @example
   *   variableDeclarationMethod('isWeex', true)
   *
   *   const isWeex = true;
   */

  function variableDeclarationMethod(name, value) {
    return types.VariableDeclaration('const', [types.variableDeclarator(types.Identifier(name), types.BooleanLiteral(value))]);
  }
  /**
   * generator object expression
   *
   * @param  {string} platformName specified platform value it true
   * @return {objectExpression}
   * @example
   *   objectExpressionMethod('isWeex')
   *
   *   {
   *     isWeex: true,
   *     isWeb: false
   *   }
   */


  function objectExpressionMethod(platformName) {
    var properties = [];
    Object.keys(platformMap).forEach(function (p) {
      properties.push(types.objectProperty(types.Identifier(platformMap[p]), types.booleanLiteral(p === platformName)));
    });
    return types.objectExpression(properties);
  }

  var ast;

  try {
    ast = babylon.parse(inputSource, {
      sourceType: 'module',
      plugins: ['*']
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      err.lineNumber = err.loc.line;
      err.column = err.loc.column + 1; // remove trailing "(LINE:COLUMN)" acorn message and add in esprima syntax error message start

      err.message = 'Line ' + err.lineNumber + ': ' + err.message.replace(/ \((\d+):(\d+)\)$/, '') + // add codeframe
      '\n\n' + codeFrame(inputSource, err.lineNumber, err.column, {
        highlightCode: true
      });
    }

    throw err;
  }

  traverse(ast, {
    enter: function enter() {
      specified = new Array();

      if (typeof platformMap[options.platform] !== 'undefined') {
        hasPlatformSpecified = true;
      }
    },
    // Support commonjs method `require`
    CallExpression: function CallExpression(path) {
      var node = path.node;

      if (hasPlatformSpecified && node.callee.name === 'require' && node.arguments[0] && -1 !== options.name.indexOf(node.arguments[0].value)) {
        path.replaceWith(objectExpressionMethod(options.platform));
      }
    },
    ImportDeclaration: function ImportDeclaration(path) {
      var node = path.node;

      if (-1 !== options.name.indexOf(node.source.value)) {
        node.specifiers.forEach(function (spec) {
          if (spec.type === 'ImportNamespaceSpecifier') {
            specified.push({
              local: spec.local.name,
              imported: '*'
            });
          } else {
            specified.push({
              local: spec.local.name,
              imported: spec.imported.name
            });
          }
        });

        if (hasPlatformSpecified) {
          specified.forEach(function (specObj) {
            if (specObj.imported === '*') {
              path.insertAfter(types.VariableDeclaration('const', [types.variableDeclarator(types.Identifier(specObj.local), objectExpressionMethod(options.platform))]));
            } else {
              var newNodeInit = specObj.imported === platformMap[options.platform] ? true : false;
              var newNode = variableDeclarationMethod(specObj.imported, newNodeInit);
              path.insertAfter(newNode); // Support custom alise import:
              // import { isWeex as iw } from 'universal-env';
              // const isWeex = true;
              // const iw = true;

              if (specObj.imported !== specObj.local) {
                newNode = variableDeclarationMethod(specObj.local, newNodeInit);
                path.insertAfter(newNode);
              }
            }
          });
          path.remove();
        }
      }
    }
  });
  return generate(ast, Object.assign({
    sourceMaps: true,
    sourceFileName: 'inline',
    sourceMapTarget: 'inline'
  }, sourceMapOption), inputSource);
}
;