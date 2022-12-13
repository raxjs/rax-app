/* eslint new-cap: off */
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const generate = require('@babel/generator').default;
const { codeFrameColumns } = require('@babel/code-frame');

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

module.exports = function traverseImport(options, inputSource, sourceMapOption) {
  let specified; // Collector import specifiers
  const { sourceFileName } = sourceMapOption;
  const { platform, name: libNames, memberExpObjName, platformMap: userPlatformMap, excludePlatformMap } = options;

  // merge user platformMap
  userPlatformMap &&
    Object.keys(platformMap).forEach((p) => {
      userPlatformMap[p] &&
        userPlatformMap[p].forEach((k) => {
          if (!platformMap[p].includes(k)) {
            platformMap[p].push(k);
          }
        });
    });

  const hasPlatformSpecified = typeof platformMap[platform] !== 'undefined';
  const platformVarMap = Object.keys(platformMap).reduce((map, p) => {
    platformMap[p].forEach((name) => {
      // multiple isWeb compat, in platform web and kraken
      map[name] = map[name] || (p === platform);
    });
    return map;
  }, {});

  // ignore platform variable
  if (excludePlatformMap && excludePlatformMap[platform]) {
    excludePlatformMap[platform].forEach((v) => {
      if (typeof platformVarMap[v] !== 'undefined') {
        delete platformVarMap[v];
      }
    });
  }

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
  // function objectExpressionMethod(platformName) {
  //   const properties = Object.keys(platformVarMap).map((key) => {
  //     return types.objectProperty(
  //       types.Identifier(key),
  //       types.booleanLiteral(platformVarMap[key]),
  //     );
  //   });

  //   return types.objectExpression(properties);
  // }

  /**
   * generate member assignment expression
   * @param {string} objName
   * @param {string} propertyName
   * @param {boolean} value
   * @returns {AssignmentExpression}
   * @example
   *   objectMemberExpressionMethod('UniversalEnv', 'isMiniApp', true)
   *   -> UniversalEnv.isMiniApp = true;
   */
  // function objectMemberExpressionMethod(objName, propertyName, value) {
  //   return types.expressionStatement(
  //     types.assignmentExpression(
  //       '=',
  //       types.memberExpression(
  //         types.identifier(objName),
  //         types.identifier(propertyName),
  //       ),
  //       types.booleanLiteral(value),
  //     ),
  //   );
  // }

  /**
   * insert all member assignment expression in platformMap after path
   * @param {string} objName
   * @param {Path} path
   * @example
   *   addAllMpVarExpNode('U', path)
   *   -> path.insertAfter:
   *   -> U.isMiniApp = true; U.isWeChatMiniProgram = false; U.isByteDanceMicroApp = false;
   *   -> U.isNode = false; U.isWeb = false; U.isKraken = false; U.isWeex = false; ..
   */
  // function addAllMpVarExpNode(objName, path) {
  //   Object.keys(platformVarMap).forEach((k) => {
  //     path.insertAfter(
  //       objectMemberExpressionMethod(objName, k, platformVarMap[k]),
  //     );
  //   });
  // }

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

  /**
   * Don't touch those env variables which is not involved in MiniApp, like isTaoBao, isAndroid, UA.
   * Just modify that variables in ${platformVarMap}.
   *
   * Case 1:
   * import A, { isMiniApp, isTaoBaoClient as isT, isAndroid, UA } from 'npm-a';
   * -> import A, { isTaoBaoClient as isT, isAndroid, UA } from 'npm-a'; (rm isMiniApp)
   * -> A.isMiniApp = true|false; A.isWeChatMiniProgram = true|false; ... all platformVarMap
   * -> const isMiniApp = true|false;
   * import A, * as A_Namespace from 'npm-a'; ditto
   * const A = require('npm-b'); ditto
   *
   * Case 2:（reason see MemberExpression part below）
   * _universalEnv.isMiniApp && console.log('mp');
   * _universalEnv.isT && console.log('non-mp');
   * -> true|false && console.log('mp');
   * -> _universalEnv.isT && console.log('non-mp');
   */
  traverse(ast, {
    enter() {
      specified = [];
    },
    // Already have Case 2, So this is useless below.
    // // Support commonjs method `require`
    // CallExpression(path) {
    //   const { node } = path;
    //   /**
    //    * const E = require('');
    //    * -> const E = require('');
    //    * -> E.isMiniApp = true|false; E.isWeChatMiniProgram = true|false; ... all platformVarMap
    //    */
    //   if (
    //     hasPlatformSpecified &&
    //     node.callee.name === 'require' &&
    //     node.arguments[0] &&
    //     libNames.indexOf(node.arguments[0].value) !== -1
    //   ) {
    //     const objName = path.parent.id && path.parent.id.name;
    //     objName && addAllMpVarExpNode(objName, path.parentPath.parentPath);
    //   }
    // },
    MemberExpression(path) {
      // fix babel-plugin-minify-dead-code-elimination bug.
      // only remove like: var isWeex = false; if(isWeex){ xxx }
      // don't remove like: var _universalEnv = {isWeex: false}; if(_universalEnv.isWeex){ xxx }
      // change _universalEnv.isWeex to false
      const { node, parent } = path;
      const objName = node.object.name;
      if (hasPlatformSpecified && memberExpObjName.indexOf(objName) !== -1) {
        const propertyName = node.property.name;
        const isPlatformVar = typeof platformVarMap[propertyName] !== 'undefined';
        const left = parent && parent.left;
        const isMemberAssignExp =
          left &&
          types.isAssignmentExpression(parent) &&
          types.isMemberExpression(left) &&
          left.object.name === objName &&
          left.property.name === propertyName;
        // Restrict the scope of MemberExpression, don't touch _xxxEnv.isIOS|isTaoBao|UA|appName, just apply to platformMaps.
        // Transform excludes: _universalEnv.isMiniApp = true|false;
        if (isPlatformVar && !isMemberAssignExp) {
          const value = String(platformMap[platform].indexOf(propertyName) >= 0);
          path.replaceWith(types.Identifier(value));
        }
      }
    },
    ImportDeclaration(path) {
      const { node } = path;

      if (libNames.indexOf(node.source.value) !== -1) {
        node.specifiers.forEach((spec) => {
          if (spec.type === 'ImportNamespaceSpecifier') {
            specified.push({
              local: spec.local.name,
              imported: '*',
            });
          } else if (spec.type === 'ImportDefaultSpecifier') {
            specified.push({
              local: spec.local.name,
              imported: '~',
            });
          } else {
            specified.push({
              local: spec.local.name,
              imported: spec.imported.name,
            });
          }
        });

        if (hasPlatformSpecified) {
          specified.forEach((specObj, specIdx) => {
            if (specObj.imported === '~' || specObj.imported === '*') {
              /**
               * import A from ''; or import * as A from '';
               * -> import A from '';
               * -> A.isMiniApp = true|false; A.isWeChatMiniProgram = true|false; ... all platformVarMap
               */
              // Already have Case 2, So this is useless below.
              // const objName = specObj.local;
              // addAllMpVarExpNode(objName, path);
            } else {
              /**
               * import { isMiniApp as isMp, isTaoBaoClient, isAndroid } from '';
               * -> import { isTaoBaoClient, isAndroid } from ''; rm platform importSpecifier: isMiniApp
               * -> const isMp = true; (can't const isMiniApp = true;)
               */
              const isMpEnvVar = typeof platformVarMap[specObj.imported] !== 'undefined';
              if (isMpEnvVar) {
                const name = specObj.imported !== specObj.local ? specObj.local : specObj.imported;
                const value = platformMap[platform].indexOf(specObj.imported) >= 0;
                path.insertAfter(
                  variableDeclarationMethod(name, value),
                );
                delete node.specifiers[specIdx];
              }
            }
          });

          /**
           * Remove path if specifiers is empty after operate above.
           * match: import { isMiniApp } from '';
           * not match:
           *   import A, { isMiniApp } from '';
           *   import * as A, { isMiniApp } from '';
           *   import { isMiniApp, isTaoBao, isAndroid } from '';
           */
          node.specifiers = node.specifiers.filter((s) => s);
          if (!node.specifiers.length) {
            path.remove();
          }
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
