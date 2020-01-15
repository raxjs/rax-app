import * as babylon from 'babylon';
import generate from 'babel-generator';
import traverse from 'babel-traverse';
import { IF_KEY, FOR_KEY } from './defaultKey';
var FULL_VALUE_REG = /\{\{(.*)\}\}/g;
export var transformFor = function transformFor(attributes, begin, scope) {
  if (begin === void 0) {
    begin = true;
  }

  if (scope === void 0) {
    scope = {};
  }

  var output = '';
  hasForKey(attributes, function (attribute) {
    var value = attribute.value.replace(FULL_VALUE_REG, '$1');
    value = value.split(' in '); // fall short of rule eg. '{{item in items}}'

    if (!value[0] || !value[1]) {
      return '';
    }

    if (begin) {
      scope[value[0]] = 1;
      output += "{props." + value[1] + ".map((" + value[0] + ") => {return (";
    } else {
      scope[value[0]] = null;
      delete scope[value[0]];
      output = ');})}';
    }
  });
  return output;
}; // transform if block

export var transformIf = function transformIf(attributes, begin, scope) {
  if (begin === void 0) {
    begin = true;
  }

  var output = '';
  hasIfKey(attributes, function (attribute) {
    if (begin) {
      output += "{(" + attribute.value.replace(FULL_VALUE_REG, function (word, $1) {
        return transformPair($1, scope);
      }) + ") && ";
    } else {
      output = '}';
    }
  });
  return output;
};
export var hasIfKey = function hasIfKey(attributes, callback) {
  return hasKey(IF_KEY, attributes, callback);
};
export var hasForKey = function hasForKey(attributes, callback) {
  return hasKey(FOR_KEY, attributes, callback);
};

var hasKey = function hasKey(keyName, attributes, callback) {
  if (attributes === void 0) {
    attributes = [];
  }

  if (callback === void 0) {
    callback = function callback() {};
  }

  var hasKey = false;
  attributes = Array.from(attributes);
  attributes.forEach(function (attribute) {
    if (attribute.name === keyName) {
      hasKey = true;
      callback(attribute);
    }
  });
  return hasKey;
};

export function transformPair(code, scope, config) {
  if (config === void 0) {
    config = {};
  }

  var visitor = {
    noScope: 1,
    enter: function enter(path) {
      var node = path.node,
          parent = path.parent;

      if (node.type !== 'Identifier') {
        return;
      }

      var type = parent && parent.type;

      if ((type !== 'MemberExpression' || parent.object === node || parent.property === node && parent.computed) && (type !== 'ObjectProperty' || parent.key !== node) && !findScope(scope, node.name)) {
        node.name = "props." + node.name;
      }
    }
  };
  var codeStr = code;
  var ast = babylon.parse("(" + codeStr + ")");
  traverse(ast, visitor);
  var newCode = generate(ast).code;

  if (newCode.charAt(newCode.length - 1) === ';') {
    newCode = newCode.slice(0, -1);
  }

  return "(" + newCode + ")";
}

function findScope(scope, name) {
  return scope[name];
}