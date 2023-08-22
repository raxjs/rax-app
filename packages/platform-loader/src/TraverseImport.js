/* eslint new-cap: off */
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generate = require('@babel/generator').default;
const { codeFrameColumns } = require('@babel/code-frame');

module.exports = function traverseImport(options, inputSource, sourceMapOption) {
  let specified; // Collector import specifiers
  let hasPlatformSpecified = false;
  const { sourceFileName } = sourceMapOption;

  const platformMap = {
    weex: ['isWeex'],
    web: ['isWeb'],
    kraken: ['isKraken', 'isWeb'],
    node: ['isNode'],
    miniapp: ['isMiniApp'],
    'wechat-miniprogram': ['isWeChatMiniProgram', 'isWeChatMiniprogram'],
    'bytedance-microapp': ['isByteDanceMicroApp'],
    'kuaishou-miniprogram': ['isKuaiShouMiniProgram'],
    'baidu-smartprogram': ['isBaiduSmartProgram'],
  };
  const platformMapValues = Object.keys(platformMap).reduce((arr, key) => arr.concat(platformMap[key]), []);

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

    const propertyMap = {};
    Object.keys(platformMap).forEach((p) => {
      const keys = platformMap[p];
      for (const key of keys) {
        if (!propertyMap[key]) {
          propertyMap[key] = p === platformName;
        }
      }
    });

    Object.keys(propertyMap).forEach((key) => {
      properties.push(
        types.objectProperty(
          types.Identifier(key),
          types.booleanLiteral(propertyMap[key]),
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
        /\.ts$/.test(sourceFileName) ? '' : 'jsx',
        /\.tsx?$/.test(sourceFileName) ? 'typescript' : '',
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
      const location = {
        start: {
          line: err.loc.line,
          column: err.loc.column + 1,
        },
      };

      // remove trailing "(LINE:COLUMN)" acorn message and add in esprima syntax error message start
      console.log(`Line ${err.lineNumber}: ${err.message.replace(/ \((\d+):(\d+)\)$/, '')
      // add codeframe
      }\n\n${
        codeFrameColumns(inputSource, location, { highlightCode: true })}`);
    } else {
      console.log(err);
    }
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
      // Restrict the scope of MemberExpression, don't touch _xxxEnv.isIOS|isTaobao|UA|appName, just apply to platformMaps.
      const { node } = path;
      const propertyName = node.property.name;
      if (hasPlatformSpecified && options.memberExpObjName.indexOf(node.object.name) !== -1 && platformMapValues.includes(propertyName)) {
        if (platformMap[options.platform].indexOf(propertyName) >= 0) {
          path.replaceWith(types.Identifier('true'));
        } else {
          path.replaceWith(types.Identifier('false'));
        }
      }
    },
    ImportDeclaration(path) {
      const { node } = path;

      if (options.name.indexOf(node.source.value) !== -1) {
        node.specifiers.forEach((spec) => {
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
          specified.forEach((specObj) => {
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
              // Support custom alias import:
              // import { isWeex as iw } from 'universal-env';
              // Correct the logic of next line. Variable "isWeex" can be declared again after alias to "iw”. So, can't insert "const isWeex = true".
              // const isWeex = true;
              // const iw = true;
              const newNodeInit = platformMap[options.platform].indexOf(specObj.imported) >= 0;
              const hasAlias = specObj.imported !== specObj.local;
              const newNode = variableDeclarationMethod(
                hasAlias ? specObj.local : specObj.imported,
                newNodeInit,
              );
              path.insertAfter(newNode);
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
