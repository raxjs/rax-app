const { nanoid } = require('nanoid');
const t = require('@babel/types');

module.exports = function visitor({ types: t }, { staticTmpls = [], target }) {
  return {
    visitor: {
      JSXElement(path) {
        const { node } = path;
        if (!node.__static && validStaticElement(path)) {
          const tagName = nanoid(8);
          const attributes = node.openingElement.attributes;
          attributes.push(t.jsxAttribute(t.jsxIdentifier('__tagName'), t.stringLiteral(tagName)));
          const tmpl = generateTmpl(path, target);
          staticTmpls.push({
            tagName,
            tmpl
          });
        }
      }
    }
  };
};

const htmlTagList = new Set(['div', 'span']);

const validTagName = tagName => htmlTagList.has(tagName);

const validStaticElement = path => {
  const { node } = path;
  if (Object.prototype.hasOwnProperty.call(node, '__valid')) return node.__valid;
  if (path.isJSXElement()) {
    const openingElement = node.openingElement;
    if (!validTagName(openingElement.name.name)) return false;
  }
  const childrenPath = path.get('children');
  let valid = true;
  for (let i = 0; i < childrenPath.length; i++) {
    if (childrenPath[i].isJSXExpressionContainer()) {
      valid = false;
      break;
    }
    if (childrenPath[i].isJSXElement() || childrenPath[i].isJSXFragment()) {
      valid = validStaticElement(childrenPath[i]);
      if (!valid) break;
    }
  }
  node.__valid = valid;
  return valid;
};

const generateTmpl = (path, target, seniority = '', tmpl = '') => {
  const { node } = path;
  node.__static = true;
  const childrenPath = path.get('children');
  if (childrenPath.length === 0) return tmpl;
  const isJSXElement = path.isJSXElement();
  if (isJSXElement) {
    tmpl = generateCurrentElement(path, target, seniority, tmpl);
  }
  let realDomIndex = 0;
  for (let i = 0; i < childrenPath.length; i++) {
    if (childrenPath[i].isJSXText()) {
      if (childrenPath[i].node.value.replace(/\n|\s/g, '').length !== 0) {
        tmpl += childrenPath[i].node.value;
        realDomIndex++;
      }
    }

    if (childrenPath[i].isJSXElement() || childrenPath[i].isJSXFragment()) {
      tmpl = generateTmpl(childrenPath[i], target, seniority + `.children[${realDomIndex}]`, tmpl);
      realDomIndex++;
    }
  }
  if (isJSXElement) {
    tmpl += '</view>';
  }
  return tmpl;
};

const generateCurrentElement = (path, target, seniority, tmpl) => {
  const { node } = path;
  tmpl += '<view';
  const attributes = node.openingElement.attributes;
  const attrs = new Set();
  attributes.forEach(attrNode => {
    let attrName = attrNode.name.name;

    if (!/^on/.test(attrName)) {
      if (attrName === 'className') {
        attrName = 'class';
      }
      if (t.isStringLiteral(attrNode.value)) {
        tmpl += ` ${attrName}="${attrNode.value.value}"`;
      } else if (t.isJSXExpressionContainer()) {
        tmpl += ` ${attrName}="{{r${seniority}.${attrName}}}"`;
      }
      attrs.add(attrName);
    } else {
      let eventName = attrName;
      if (attrName === 'onClick') {
        attrName = 'onTap';
        eventName = 'onTap';
      }
      if (target === 'wechat-miniprogram') {
        eventName = attrName.replace('on', 'bind').toLowerCase();
      }
      tmpl += ` ${eventName}="${attrName}"`;
    }
  });
  ['class', 'style'].forEach(name => {
    if (!attrs.has(name)) {
      tmpl += ` ${name}="{{r${seniority}['${name}']}}"`;
    }
  });
  tmpl += ` data-private-node-id="{{r${seniority}.nodeId}}">`;
  return tmpl;
};
