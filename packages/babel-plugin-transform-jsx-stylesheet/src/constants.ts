// Maybe modified.
export let styleSheetName = '_styleSheet';
export const GET_STYLE_FUNC_NAME = '_getStyle';
export const MERGE_STYLES_FUNC_NAME = '_mergeStyles';
export const GET_CLS_NAME_FUNC_NAME = '_getClassName';
export const NAME_SUFFIX = 'StyleSheet';
export const cssSuffixs = ['.css', '.scss', '.sass', '.less', '.styl'];

export function setStyleSheetName(name) {
  styleSheetName = name;
}

export const mergeStylesFunctionString = () => `function ${MERGE_STYLES_FUNC_NAME}() {
  var newTarget = {};

  for (var index = 0; index < arguments.length; index++) {
    var target = arguments[index];

    for (var key in target) {
      newTarget[key] = Object.assign(newTarget[key] || {}, target[key]);
    }
  }

  return newTarget;
}`;

export const getClassNameFunctionString = () => `function ${GET_CLS_NAME_FUNC_NAME}() {
  var className = [];
  var args = arguments[0];
  var type = Object.prototype.toString.call(args).slice(8, -1).toLowerCase();

  if (type === 'string') {
    args = args.trim();
    args && className.push(args);
  } else if (type === 'array') {
    args.forEach(function (cls) {
      cls = ${GET_CLS_NAME_FUNC_NAME}(cls).trim();
      cls && className.push(cls);
    });
  } else if (type === 'object') {
    for (var k in args) {
      k = k.trim();

      if (k && args.hasOwnProperty(k) && args[k]) {
        className.push(k);
      }
    }
  }

  return className.join(' ').trim();
}`;

export const getStyleFunctionString = () => `function ${GET_STYLE_FUNC_NAME}(classNameExpression) {
  var cache = ${styleSheetName}.__cache || (${styleSheetName}.__cache = {});

  var className = ${GET_CLS_NAME_FUNC_NAME}(classNameExpression);

  var classNameArr = className.split(/\\s+/);
  var style = cache[className];

  if (!style) {
    style = {};

    if (classNameArr.length === 1) {
      style = ${styleSheetName}[classNameArr[0].trim()];
    } else {
      classNameArr.forEach(function (cls) {
        var value = ${styleSheetName}[cls.trim()];

        if (typeof value === 'object') {
          style = Object.assign(style, ${styleSheetName}[cls.trim()]);
        }
      });
    }

    cache[className] = style;
  }

  return style;
}`;
