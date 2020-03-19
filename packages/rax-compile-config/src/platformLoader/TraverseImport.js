/* eslint new-cap: off */
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generate = require('@babel/generator').default;
const codeFrame = require('@babel/code-frame').default;

module.exports = function traverseImport(options, inputSource, sourceMapOption) {
  let specified; // Collector import specifiers
  let hasPlatformSpecified = false;

  const platformMap = {
    weex: 'isWeex',
    web: 'isWeb',
    kraken: 'isKraken',
    node: 'isNode',
    miniapp: 'isMiniApp',
    WeChatMiniprogram: 'isWeChatMiniprogram',
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
    return types.VariableDeclaration(
      'const', [
        types.variableDeclarator(
          types.Identifier(name),
          types.BooleanLiteral(value),
        ),
      ],
    );
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
    const properties = [];

    Object.keys(platformMap).forEach((p) => {
      properties.push(
        types.objectProperty(
          types.Identifier(platformMap[p]),
          types.booleanLiteral(p === platformName),
        ),
      );
    });

    return types.objectExpression(properties);
  }

  let ast;

  try {
    ast = babelParser.parse(inputSource, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'classProperties',
        'objectRestSpread',
        'optionalCatchBinding',
        'dynamicImport',
        'decorators-legacy',
        'asyncGenerators',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'optionalCatchBinding',
        'throwExpressions',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      err.lineNumber = err.loc.line;
      err.column = err.loc.column + 1;

      // remove trailing "(LINE:COLUMN)" acorn message and add in esprima syntax error message start
      err.message = `Line ${err.lineNumber}: ${err.message.replace(/ \((\d+):(\d+)\)$/, '')
        // add codeframe
      }\n\n${
        codeFrame(inputSource, err.lineNumber, err.column, { highlightCode: true })}`;
    }

    throw err;
  }

  traverse(ast, {
    enter() {
      specified = [];

      if (typeof platformMap[options.platform] !== 'undefined') {
        hasPlatformSpecified = true;
      }
    },
    // Support commonjs method `require`
    CallExpression(path) {
      const { node } = path;

      if (
        hasPlatformSpecified &&
        node.callee.name === 'require' &&
        node.arguments[0] &&
        options.name.indexOf(node.arguments[0].value) !== -1
      ) {
        path.replaceWith(objectExpressionMethod(options.platform));
      }
    },
    MemberExpression(path) {
      // fix babel-plugin-minify-dead-code-elimination bug.
      // only remove like: var isWeex = false; if(isWeex){ xxx }
      // don't remove like: var _universalEnv = {isWeex: false}; if(_universalEnv.isWeex){ xxx }
      // change _universalEnv.isWeex to false
      const { node } = path;
      if (node.object.name === '_universalEnv') {
        if (node.property.name === platformMap[options.platform]) {
          path.replaceWith(types.Identifier('true'));
        } else {
          path.replaceWith(types.Identifier('false'));
        }
      }
    },
    ImportDeclaration(path) {
      const { node } = path;

      if (options.name.indexOf(node.source.value) !== -1) {
        node.specifiers.forEach(spec => {
          if (spec.type === 'ImportNamespaceSpecifier') {
            specified.push({
              local: spec.local.name,
              imported: '*',
            });
          } else {
            specified.push({
              local: spec.local.name,
              imported: spec.imported.name,
            });
          }
        });

        if (hasPlatformSpecified) {
          specified.forEach(specObj => {
            if (specObj.imported === '*') {
              path.insertAfter(types.VariableDeclaration(
                'const', [
                  types.variableDeclarator(
                    types.Identifier(specObj.local),
                    objectExpressionMethod(options.platform),
                  ),
                ],
              ));
            } else {
              const newNodeInit = specObj.imported === platformMap[options.platform];
              let newNode = variableDeclarationMethod(
                specObj.imported,
                newNodeInit,
              );

              path.insertAfter(newNode);

              // Support custom alise import:
              // import { isWeex as iw } from 'universal-env';
              // const isWeex = true;
              // const iw = true;
              if (specObj.imported !== specObj.local) {
                newNode = variableDeclarationMethod(
                  specObj.local,
                  newNodeInit,
                );
                path.insertAfter(newNode);
              }
            }
          });

          path.remove();
        }
      }
    },
  });

  return generate(ast, Object.assign({
    sourceMaps: true,
    sourceFileName: 'inline',
    sourceMapTarget: 'inline',
  }, sourceMapOption), inputSource);
};
