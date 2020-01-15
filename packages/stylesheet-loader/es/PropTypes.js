import normalizeColor from './normalizeColor';
var LENGTH_REGEXP = /^[-+]?[0-9]*\.?[0-9]+(px|em|rpx|rem|\%)?$/;
var INTEGER_REGEXP = /^[-+]?[0-9]+$/;
var PropTypes = {
  length: createLengthChecker,
  number: createNumberChecker,
  integer: createIntegerChecker,
  oneOf: createEnumChecker,
  color: createColorChecker,
  string: createStringChecker
};

function createLengthChecker(value, prop, selectors) {
  if (value === void 0) {
    value = '';
  }

  value = value.toString();

  if (!value.match(LENGTH_REGEXP)) {
    return new Error(getMessage(prop, value, selectors, '16、16rem、16px'));
  }

  return null;
}

function createNumberChecker(value, prop, selectors) {
  if (value === void 0) {
    value = '';
  }

  value = value.toString();
  var match = value.match(LENGTH_REGEXP);

  if (!match || match[1]) {
    return new Error(getMessage(prop, value, selectors, '16、24、5.2'));
  }

  return null;
}

function createIntegerChecker(value, prop, selectors) {
  if (value === void 0) {
    value = '';
  }

  value = value.toString();

  if (!value.match(INTEGER_REGEXP)) {
    return new Error(getMessage(prop, value, selectors, '16、24、12'));
  }

  return null;
}

function createEnumChecker(list) {
  return function validate(value, prop, selectors) {
    var index = list.indexOf(value);

    if (index < 0) {
      return new Error(getMessage(prop, value, selectors, "" + list.join('、')));
    }

    return null;
  };
}

function createColorChecker(value, prop, selectors) {
  if (typeof value === 'number') {
    return;
  }

  if (normalizeColor(value) === null) {
    return new Error(getMessage(prop, value, selectors, '#333、#fefefe、rgb(255, 0, 0)'));
  }

  return null;
}

function createStringChecker(value, prop, selectors) {
  if (!value) {
    return new Error(getMessage(prop, value, selectors, ''));
  }

  return null;
}

function getMessage(prop, value, selectors, link) {
  return "\"" + prop + ": " + value + "\" is not valid value in \"" + selectors + "\" selector (e.g. \"" + link + "\")";
}

export default PropTypes;