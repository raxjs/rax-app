'use strict';

import normalizeColor from './normalizeColor';
var NUMBER_REG = /^[-+]?\d*\.?\d+$/;

function convertUnit(val) {
  if (NUMBER_REG.test(val)) {
    return parseFloat(val);
  }

  return val;
}

function measure(value, key) {
  var direction = [];

  if (typeof value === 'number') {
    direction = [value, value, value, value];
  } else if (typeof value === 'string') {
    direction = value.split(/\s+/);

    switch (direction.length) {
      case 2:
        direction[2] = direction[0];
        direction[3] = direction[1];
        break;

      case 3:
        direction[3] = direction[1];
        break;

      case 4:
        break;

      default:
        return {};
    }
  }

  var topKey = key + 'Top';
  var rightKey = key + 'Right';
  var bottomKey = key + 'Bottom';
  var leftKey = key + 'Left';
  var result = {
    isDeleted: true
  };
  result[topKey] = convertUnit(direction[0]);
  result[rightKey] = convertUnit(direction[1]);
  result[bottomKey] = convertUnit(direction[2]);
  result[leftKey] = convertUnit(direction[3]);
  return result;
}

;

var prefix = function prefix(value, key) {
  var word = key.substring(0, 1).toUpperCase() + key.substring(1);
  var result = {
    isDeleted: true
  };
  result['ms' + word] = value;
  result['webkit' + word] = value;
  result[key] = value;
  return result;
};

var _border = function border(key, value) {
  var result = {
    isDeleted: true
  };
  var direction = value && value.split(' ');
  result[key + 'Width'] = direction && convertUnit(direction[0]);
  result[key + 'Style'] = direction && direction[1];
  result[key + 'Color'] = direction && normalizeColor(direction[2]);
  return result;
};

var toMs = function toMs(value) {
  if (typeof value === 'string') {
    if (/^\./.test(value)) value = '0' + value; // .5s

    if (/s$/.test(value) && !/ms$/.test(value)) {
      // 1.5s
      value = parseFloat(value) * 1000;
    } else {
      // 150 or 150ms
      value = parseFloat(value);
    }
  }

  return (value || 0) + 'ms';
};

var _transitionProperty = function transitionProperty(value) {
  if (value === 'all') {
    value = 'width,height,top,bottom,left,right,backgroundColor,opacity,transform';
  } else if (value === 'none' || !value) {
    return {
      isDeleted: true
    };
  }

  return {
    transitionProperty: value.replace('background-color', 'backgroundColor')
  };
};

var _transition = function transition(value) {
  var result = {
    isDeleted: true
  };
  var options = (value || '').trim().replace(/cubic-bezier\(.*\)/g, function ($0) {
    return $0.replace(/\s+/g, '');
  }) // transition: all 0.2s cubic-bezier( 0.42, 0, 0.58, 1 ) 0s
  .split(/\s+/);

  var property = _transitionProperty(options[0] || 'all');

  if (!property.isDeleted) result.transitionProperty = property.transitionProperty;
  result.transitionTimingFunction = (options[2] || 'ease').replace(/\s+/g, '');
  result.transitionDuration = toMs(options[1]);
  result.transitionDelay = toMs(options[3]);
  return result;
};

export default {
  border: function border(value) {
    return _border('border', value);
  },
  borderTop: function borderTop(value) {
    return _border('borderTop', value);
  },
  borderRight: function borderRight(value) {
    return _border('borderRight', value);
  },
  borderBottom: function borderBottom(value) {
    return _border('borderBottom', value);
  },
  borderLeft: function borderLeft(value) {
    return _border('borderLeft', value);
  },
  padding: function padding(value) {
    return measure(value, 'padding');
  },
  margin: function margin(value) {
    return measure(value, 'margin');
  },
  lineHeight: function lineHeight(value) {
    return {
      lineHeight: value
    };
  },
  fontWeight: function fontWeight(value) {
    return {
      fontWeight: value.toString()
    };
  },
  transition: function transition(value) {
    return _transition(value);
  },
  transitionProperty: function transitionProperty(value) {
    return _transitionProperty(value);
  },
  transitionDuration: function transitionDuration(value) {
    return {
      transitionDuration: toMs(value)
    };
  },
  transitionDelay: function transitionDelay(value) {
    return {
      transitionDelay: toMs(value)
    };
  },
  transitionTimingFunction: function transitionTimingFunction(value) {
    return {
      transitionTimingFunction: value.replace(/\s+/g, '')
    };
  }
};