import htmlparser from 'htmlparser2';
import { endsWith, trimEnd, isNumber } from 'lodash';
import { transformFor, transformIf, transformPair } from './transformer';
import { IF_KEY, FOR_KEY } from './defaultKey';
import { getDomObject } from './parserHTML';

const PAIR_REG = /^\{\{(.*)}\}$/;
const NODE_TYPE = {
  ELEMENT: 'tag',
  TEXT: 'text',
  COMMENT: 'comment',
  SCRIPT: 'script',
  STYLE: 'style',
};

const HTMLtoJSX =
/* #__PURE__ */
function () {
  function HTMLtoJSX(config) {
    this.config = config || {};
    this.createClass = false;

    if (!this.config.indent) {
      this.config.indent = '  ';
    }
  }

  const _proto = HTMLtoJSX.prototype;

  _proto.reset = function reset() {
    this.output = '';
    this.outputImportText = '';
    this.level = 0;
    this.scope = {};
  };

  _proto.convert = function convert(html) {
    this.reset();
    html = this._cleanInput(html);
    let nodes = getDomObject(html);

    if (!this._onlyOneTopLevel(nodes)) {
      this.level++;
      html = `<div>\n${  html  }\n</div>`;
      nodes = getDomObject(html);
    }

    this._traverse({
      children: nodes,
    });

    this.output = `${this.output.trim()  }\n`;
    return {
      output: this.output,
      outputImportText: this.outputImportText,
    };
  };

  _proto._traverse = function _traverse(node) {
    const _this = this;

    node.children = node.children || [];
    this.level++;
    node.children.forEach(function (child) {
      _this._visit(child);
    });
    this.level--;
  };

  _proto._visit = function _visit(node) {
    // remove enter
    if (node.data && /^\n(\s?)+$/.test(node.data)) {
      return;
    }

    node.attributes = [];

    for (const key in node.attribs) {
      node.attributes.push({
        name: key,
        value: node.attribs[key],
      });
    }

    this._beginVisit(node);

    this._traverse(node);

    this._endVisit(node);
  };

  _proto._beginVisit = function _beginVisit(node) {
    this.output += `\n${  new Array(this.level - 1).join(' ')}`;

    switch (node.type) {
      case NODE_TYPE.ELEMENT:
        this._beginVisitElement(node);

        break;

      case NODE_TYPE.TEXT:
        this._visitText(node);

        break;

      case NODE_TYPE.COMMENT:
        this._visitComment(node);

        break;

      case NODE_TYPE.SCRIPT:
        break;

      case NODE_TYPE.STYLE:
        break;

      default:
        console.warn(`Unrecognised node type: ${  node.type}`);
    }
  };

  _proto._endVisit = function _endVisit(node) {
    switch (node.type) {
      case NODE_TYPE.ELEMENT:
        this.output += `\n${  new Array(this.level + 1).join(' ')}`;

        this._endVisitElement(node);

        break;

      case NODE_TYPE.TEXT:
      case NODE_TYPE.COMMENT:
      case NODE_TYPE.SCRIPT:
      case NODE_TYPE.STYLE:
        break;
    }
  };

  _proto._beginVisitElement = function _beginVisitElement(node) {
    const _this2 = this;

    const tagName = node.name;
    const outputTagName = tagName;
    const attributes = [];
    node.attributes.forEach(function (attribute) {
      attributes.push(_this2._getElementAttribute(node, attribute));
    });
    this.output += transformFor(node.attributes, true, this.scope);
    this.output += transformIf(node.attributes, true, this.scope);
    this.output += `<${  outputTagName}`;

    if (attributes.length > 0) {
      this.output += ` ${  attributes.join(' ')}`;
    }

    this.output += '>';
  };

  _proto._endVisitElement = function _endVisitElement(node) {
    const tagName = node.name;
    const outputTagName = tagName;
    this.output = trimEnd(this.output, this.config.indent);
    this.output += `</${  outputTagName  }>`;
    this.output += transformFor(node.attributes, false, this.scope);
    this.output += transformIf(node.attributes, false, this.scope);
  };

  _proto._visitText = function _visitText(node) {
    const _this3 = this;

    let text = node.data;

    if (PAIR_REG.test(text)) {
      text = text.replace(PAIR_REG, function (word, $1) {
        if (/^\{\{([props.].*)}\}$/.test(text)) {
          return `{${  $1  }}`;
        }

        return `{${  transformPair($1, _this3.scope)  }}`;
      });
    }

    this.output += text;
  };

  _proto._visitComment = function _visitComment(node) {
    this.output += `{/*${  node.data.replace('*/', '* /')  }*/}`;
  };

  _proto._onlyOneTopLevel = function _onlyOneTopLevel(nodes) {
    const _rootNodes = nodes.filter(function (node) {
      return !/\n+/.test('\n');
    });

    return _rootNodes.length === 1;
  };

  _proto._getElementAttribute = function _getElementAttribute(node, attribute) {
    switch (attribute.name) {
      case 'src':
        return `source={{uri: "${  attribute.value  }"}}`;

      case 'class':
        var value = attribute.value.trim();
        var multiClass = value.split(' ');
        var style = '';

        if (multiClass.length === 1) {
          style = `styles.${  multiClass[0]}`;
        } else {
          style += '[';
          multiClass = multiClass.map(function (className) {
            return `styles.${  className}`;
          });
          style += multiClass.join(', ');
          style += ']';
        }

        return `style={${  style  }}`;

      case IF_KEY:
      case FOR_KEY:
        break;

      default:
        var tagName = node.name;
        var name = attribute.name;
        var result = name; // Numeric values should be output as {123} not "123"

        if (isNumber(attribute.value)) {
          result += `={${  attribute.value  }}`;
        } else if (attribute.value.length > 0) {
          result += `="${  attribute.value.replace(/"/gm, '&quot;')  }"`;
        }

        return result;
    }
  };

  _proto._cleanInput = function _cleanInput(html) {
    html = html.trim();
    return html;
  };

  return HTMLtoJSX;
}();

export { HTMLtoJSX as default };