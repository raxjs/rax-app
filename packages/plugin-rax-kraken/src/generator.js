const parse5 = require('parse5');

exports.getInjectJS = function getInjectJS(url) {
  return [
    '!function(){',
    'var s=document.createElement("script");',
    `s.src="${url}";`,
    'document.head.appendChild(s);',
    '}();',
  ].join('');
}

exports.getInjectStyle = function getInjectStyle(content) {
  return [
    '!function(){',
    'var s=document.createElement("style");',
    `s.appendChild(document.createTextNode(${JSON.stringify(content)}));`,
    'document.head.appendChild(s);',
    '}();',
  ].join('');
}

exports.getInjectContent = function getInjectContent(content, injectTarget) {
  content = String(content).trim();
  if (!content) return '';

  // The injected target, usually 'document.body' or 'document.head'.
  if (!injectTarget) injectTarget = 'document.body';

  const root = parse5.parseFragment(content);
  let identifierCount = 0;
  let codes = '';
  traverseNode(root, (node) => {
    // Ignoring #document-fragment.
    if (node.nodeName === '#document-fragment') return;

    const parentEl = node.parentNode === root ? injectTarget : node.parentNode.identifier;
    if (node.nodeName === '#text'/* TextNode */) {
      codes += `${parentEl}.appendChild(document.createTextNode(${JSON.stringify(node.value)}));`;
    } else if (node.nodeName === node.tagName/* HTMLElement */) {
      const identifier = `i${identifierCount++}`;
      codes += `var ${identifier}=document.createElement(${JSON.stringify(node.tagName)});`;
      node.attrs.forEach((attr) => {
        codes += `${identifier}.setAttribute(${JSON.stringify(attr.name)},${JSON.stringify(attr.value)});`;
      });
      codes += `${parentEl}.appendChild(${identifier});`;
      node.identifier = identifier;
    }
  });
  return codes ? `!function(){${codes}}();` : '';
}

function traverseNode(node, callback) {
  callback(node);
  if (node.childNodes) {
    node.childNodes.forEach((sub) => traverseNode(sub, callback));
  }
}
