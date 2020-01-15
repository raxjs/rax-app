import path from 'path';
import camelcase from 'camelcase';

const STYLE_SHEET_NAME = '_styleSheet';
const GET_STYLE_FUNC_NAME = '_getStyle';
const MERGE_STYLES_FUNC_NAME = '_mergeStyles';
const GET_CLS_NAME_FUNC_NAME = '_getClassName';
const NAME_SUFFIX = 'StyleSheet';
const cssSuffixs = ['.css', '.scss', '.sass', '.less', '.styl'];
export default function (_ref) {
  const t = _ref.types;
  const template = _ref.template;
  const mergeStylesFunctionTemplate = template(`\nfunction ${  MERGE_STYLES_FUNC_NAME  }() {\n  var newTarget = {};\n\n  for (var index = 0; index < arguments.length; index++) {\n    var target = arguments[index];\n\n    for (var key in target) {\n      newTarget[key] = Object.assign(newTarget[key] || {}, target[key]);\n    }\n  }\n\n  return newTarget;\n}\n  `);
  const getClassNameFunctionTemplate = template(`\nfunction ${  GET_CLS_NAME_FUNC_NAME  }() {\n  var className = [];\n  var args = arguments[0];\n  var type = Object.prototype.toString.call(args).slice(8, -1).toLowerCase();\n\n  if (type === 'string') {\n    args = args.trim();\n    args && className.push(args);\n  } else if (type === 'array') {\n    args.forEach(function (cls) {\n      cls = ${  GET_CLS_NAME_FUNC_NAME  }(cls).trim();\n      cls && className.push(cls);\n    });\n  } else if (type === 'object') {\n    for (var k in args) {\n      k = k.trim();\n      if (k && args.hasOwnProperty(k) && args[k]) {\n        className.push(k);\n      }\n    }\n  }\n\n  return className.join(' ').trim();\n}\n  `);
  const getStyleFunctionTemplete = template(`\nfunction ${  GET_STYLE_FUNC_NAME  }(classNameExpression) {\n  var cache = ${  STYLE_SHEET_NAME  }.__cache || (${  STYLE_SHEET_NAME  }.__cache = {});\n  var className = ${  GET_CLS_NAME_FUNC_NAME  }(classNameExpression);\n  var classNameArr = className.split(/\\s+/);\n  var style = cache[className];\n\n  if (!style) {\n    style = {};\n    if (classNameArr.length === 1) {\n      style = ${  STYLE_SHEET_NAME  }[classNameArr[0].trim()];\n    } else {\n      classNameArr.forEach(function(cls) {\n        style = Object.assign(style, ${  STYLE_SHEET_NAME  }[cls.trim()]);\n      });\n    }\n    cache[className] = style;\n  }\n\n  return style;\n}\n  `);
  const getClassNameFunctionAst = getClassNameFunctionTemplate();
  const mergeStylesFunctionAst = mergeStylesFunctionTemplate();
  const getStyleFunctionAst = getStyleFunctionTemplete();

  function getArrayExpression(value) {
    let expression;
    let str;

    if (!value || value.value === '') {
      // className
      // className=""
      return [];
    } else if (value.type === 'JSXExpressionContainer' && value.expression && typeof value.expression.value !== 'string') {
      // className={{ container: true }}
      // className={['container wrapper', { scroll: false }]}
      return [t.callExpression(t.identifier(GET_STYLE_FUNC_NAME), [value.expression])];
    } else {
      // className="container"
      // className={'container'}
      str = (value.expression ? value.expression.value : value.value).trim();
    }

    return str === '' ? [] : str.split(/\s+/).map(function (className) {
      return template(`${STYLE_SHEET_NAME  }["${  className  }"]`)().expression;
    });
  }

  function findLastImportIndex(body) {
    const bodyReverse = body.slice(0).reverse();
    let _index = 0;
    bodyReverse.some(function (node, index) {
      if (node.type === 'ImportDeclaration') {
        _index = body.length - index - 1;
        return true;
      }

      return false;
    });
    return _index;
  }

  return {
    visitor: {
      Program: {
        exit: function exit(_ref2, _ref3) {
          const node = _ref2.node;
          const file = _ref3.file;
          const cssFileCount = file.get('cssFileCount');
          const injectGetStyle = file.get('injectGetStyle');
          const lastImportIndex = findLastImportIndex(node.body);
          const cssParamIdentifiers = file.get('cssParamIdentifiers');
          let callExpression;

          if (cssParamIdentifiers) {
            // only one css file
            if (cssParamIdentifiers.length === 1) {
              callExpression = t.variableDeclaration('var', [t.variableDeclarator(t.identifier(STYLE_SHEET_NAME), cssParamIdentifiers[0])]);
            } else if (cssParamIdentifiers.length > 1) {
              const objectAssignExpression = t.callExpression(t.identifier(MERGE_STYLES_FUNC_NAME), cssParamIdentifiers);
              callExpression = t.variableDeclaration('var', [t.variableDeclarator(t.identifier(STYLE_SHEET_NAME), objectAssignExpression)]);
            }

            node.body.splice(lastImportIndex + 1, 0, callExpression);

            if (injectGetStyle) {
              node.body.splice(lastImportIndex + 2, 0, getClassNameFunctionAst);
              node.body.splice(lastImportIndex + 3, 0, getStyleFunctionAst);
            }
          }

          if (cssFileCount > 1) {
            node.body.unshift(mergeStylesFunctionAst);
          }
        },
      },
      JSXOpeningElement: function JSXOpeningElement(_ref4, _ref5) {
        const container = _ref4.container;
        const file = _ref5.file;
        const opts = _ref5.opts;
        const _opts$retainClassName = opts.retainClassName;
        const retainClassName = _opts$retainClassName === void 0 ? false : _opts$retainClassName;
        const cssFileCount = file.get('cssFileCount') || 0;

        if (cssFileCount < 1) {
          return;
        } // Check if has "style"


        let hasStyleAttribute = false;
        let styleAttribute;
        let hasClassName = false;
        let classNameAttribute;
        const attributes = container.openingElement.attributes;

        for (let i = 0; i < attributes.length; i++) {
          const name = attributes[i].name;

          if (name) {
            if (!hasStyleAttribute) {
              hasStyleAttribute = name.name === 'style';
              styleAttribute = hasStyleAttribute && attributes[i];
            }

            if (!hasClassName) {
              hasClassName = name.name === 'className';
              classNameAttribute = hasClassName && attributes[i];
            }
          }
        }

        if (hasClassName) {
          // Dont remove className
          if (!retainClassName) {
            // development env: change className to __class
            if (process.env.NODE_ENV === 'development' && classNameAttribute.name) {
              classNameAttribute.name.name = '__class';
            } else {
              // Remove origin className
              attributes.splice(attributes.indexOf(classNameAttribute), 1);
            }
          }

          if (classNameAttribute.value && classNameAttribute.value.type === 'JSXExpressionContainer' && typeof classNameAttribute.value.expression.value !== 'string' // not like className={'container'}
          ) {
            file.set('injectGetStyle', true);
          }

          const arrayExpression = getArrayExpression(classNameAttribute.value);

          if (arrayExpression.length === 0) {
            return;
          }

          if (hasStyleAttribute && styleAttribute.value) {
            const expression = styleAttribute.value.expression;
            const expressionType = expression.type; // style={[styles.a, styles.b]} ArrayExpression

            if (expressionType === 'ArrayExpression') {
              expression.elements = arrayExpression.concat(expression.elements); // style={styles.a} MemberExpression
              // style={{ height: 100 }} ObjectExpression
              // style={{ ...custom }} ObjectExpression
              // style={custom} Identifier
              // style={getStyle()} CallExpression
              // style={this.props.useCustom ? custom : null} ConditionalExpression
              // style={custom || other} LogicalExpression
            } else {
              const mergeArrayExpression = arrayExpression.concat(expression);
              mergeArrayExpression.unshift(t.objectExpression([]));
              styleAttribute.value.expression = t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('assign')), mergeArrayExpression);
            }
          } else {
            if (arrayExpression.length > 1) {
              // Object.assign({}, ...)
              arrayExpression.unshift(t.objectExpression([]));
            }

            const _expression = arrayExpression.length === 1 ? arrayExpression[0] : t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('assign')), arrayExpression);

            attributes.push(t.jSXAttribute(t.jSXIdentifier('style'), t.jSXExpressionContainer(_expression)));
          }
        }
      },
      ImportDeclaration: function ImportDeclaration(_ref6, _ref7) {
        const node = _ref6.node;
        const file = _ref7.file;
        const sourceValue = node.source.value;
        const extname = path.extname(sourceValue);
        const cssIndex = cssSuffixs.indexOf(extname); // Do not convert `import styles from './foo.css'` kind

        if (node.specifiers.length === 0 && cssIndex > -1) {
          let cssFileCount = file.get('cssFileCount') || 0;
          const cssParamIdentifiers = file.get('cssParamIdentifiers') || [];
          const cssFileBaseName = camelcase(path.basename(sourceValue, extname));
          const styleSheetIdentifier = t.identifier(`${  cssFileBaseName + NAME_SUFFIX}`);
          node.specifiers = [t.importDefaultSpecifier(styleSheetIdentifier)];
          cssParamIdentifiers.push(styleSheetIdentifier);
          cssFileCount++;
          file.set('cssParamIdentifiers', cssParamIdentifiers);
          file.set('cssFileCount', cssFileCount);
        }
      },
    },
  };
}
;