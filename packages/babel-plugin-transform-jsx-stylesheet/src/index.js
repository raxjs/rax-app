import path from 'path';
import camelcase from 'camelcase';
import {
  GET_STYLE_FUNC_NAME,
  MERGE_STYLES_FUNC_NAME,
  NAME_SUFFIX,
  styleSheetName,
  cssSuffixs,
  mergeStylesFunctionString,
  getClassNameFunctionString,
  getStyleFunctionString,
  setStyleSheetName
} from './constants';

export default function({ types: t, template }, opts = {}) {
  const { injectedStyleName } = opts;
  if (typeof injectedStyleName === 'string') {
    setStyleSheetName(injectedStyleName);
  }

  const mergeStylesFunctionTemplate = template(mergeStylesFunctionString());
  const getClassNameFunctionTemplate = template(getClassNameFunctionString());
  const getStyleFunctionTemplete = template(getStyleFunctionString());

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

    return str === '' ? [] : str.split(/\s+/).map((className) => {
      return template(`${styleSheetName}["${className}"]`)().expression;
    });
  }

  function findLastImportIndex(body) {
    const bodyReverse = body.slice(0).reverse();
    let _index = 0;

    bodyReverse.some((node, index) => {
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
        exit({ node }, { file }) {
          const cssFileCount = file.get('cssFileCount');
          const injectGetStyle = file.get('injectGetStyle');
          const lastImportIndex = findLastImportIndex(node.body);
          let cssParamIdentifiers = file.get('cssParamIdentifiers');
          let callExpression;

          if (cssParamIdentifiers) {
            // only one css file
            if (cssParamIdentifiers.length === 1) {
              callExpression = t.variableDeclaration('var', [t.variableDeclarator(t.identifier(styleSheetName), cssParamIdentifiers[0])]);
            } else if (cssParamIdentifiers.length > 1) {
              const objectAssignExpression = t.callExpression(t.identifier(MERGE_STYLES_FUNC_NAME), cssParamIdentifiers);
              callExpression = t.variableDeclaration('var', [t.variableDeclarator(t.identifier(styleSheetName), objectAssignExpression)]);
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
        }
      },
      JSXOpeningElement({ container }, { file, opts }) {
        const {
          retainClassName = false,
          convertImport = true, // default to true
        } = opts;

        const cssFileCount = file.get('cssFileCount') || 0;
        if (cssFileCount < 1 && convertImport !== false) {
          return;
        }

        // Check if has "style"
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

          if (
            classNameAttribute.value &&
            classNameAttribute.value.type === 'JSXExpressionContainer' &&
            typeof classNameAttribute.value.expression.value !== 'string' // not like className={'container'}
          ) {
            file.set('injectGetStyle', true);
          }

          const arrayExpression = getArrayExpression(classNameAttribute.value);

          if (arrayExpression.length === 0) {
            return;
          }

          if (hasStyleAttribute && styleAttribute.value) {
            let expression = styleAttribute.value.expression;
            let expressionType = expression.type;

            // style={[styles.a, styles.b]} ArrayExpression
            if (expressionType === 'ArrayExpression') {
              expression.elements = arrayExpression.concat(expression.elements);
              // style={styles.a} MemberExpression
              // style={{ height: 100 }} ObjectExpression
              // style={{ ...custom }} ObjectExpression
              // style={custom} Identifier
              // style={getStyle()} CallExpression
              // style={this.props.useCustom ? custom : null} ConditionalExpression
              // style={custom || other} LogicalExpression
            } else {
              const mergeArrayExpression = arrayExpression.concat(expression);
              mergeArrayExpression.unshift(t.objectExpression([]));
              styleAttribute.value.expression = t.callExpression(
                t.memberExpression(t.identifier('Object'), t.identifier('assign')),
                mergeArrayExpression
              );
            }
          } else {
            if (arrayExpression.length > 1) {
              // Object.assign({}, ...)
              arrayExpression.unshift(t.objectExpression([]));
            }
            let expression = arrayExpression.length === 1 ?
              arrayExpression[0] :
              t.callExpression(
                t.memberExpression(t.identifier('Object'), t.identifier('assign')),
                arrayExpression
              );
            attributes.push(t.jSXAttribute(t.jSXIdentifier('style'), t.jSXExpressionContainer(expression)));
          }
        }
      },
      ImportDeclaration({ node }, { file, opts }) {
        // Convert style import is disabled.
        const { convertImport = true } = opts;
        if (!convertImport) return;

        const sourceValue = node.source.value;
        const extname = path.extname(sourceValue);
        const cssIndex = cssSuffixs.indexOf(extname);
        // Do not convert `import styles from './foo.css'` kind
        if (node.specifiers.length === 0 && cssIndex > -1) {
          let cssFileCount = file.get('cssFileCount') || 0;
          let cssParamIdentifiers = file.get('cssParamIdentifiers') || [];
          const cssFileBaseName = camelcase(path.basename(sourceValue, extname));
          const styleSheetIdentifier = t.identifier(`${cssFileBaseName + NAME_SUFFIX}`);

          node.specifiers = [t.importDefaultSpecifier(styleSheetIdentifier)];
          cssParamIdentifiers.push(styleSheetIdentifier);
          cssFileCount++;

          file.set('cssParamIdentifiers', cssParamIdentifiers);
          file.set('cssFileCount', cssFileCount);
        }
      }
    }
  };
};
