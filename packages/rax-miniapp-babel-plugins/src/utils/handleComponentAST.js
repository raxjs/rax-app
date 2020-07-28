const getTagName = require('./getTagName');

function collectComponentAttr(components, t) {
  return (innerPath) => {
    const { node: innerNode } = innerPath;
    if (t.isJSXIdentifier(innerNode.name)) {
      const tagName = innerNode.name.name;
      if (!components[tagName]) {
        components[tagName] = {
          props: [],
          events: []
        };
      }
      innerNode.attributes.forEach((attrNode) => {
        if (!t.isJSXIdentifier(attrNode.name)) return;
        const attrName = attrNode.name.name;
        if (
          !components[tagName].props.includes(attrName) &&
          !components[tagName].events.includes(attrName)
        ) {
          // If it starts with 'on', it must be an event handler
          if (/^on/.test(attrName)) {
            components[tagName].events.push(attrName.slice(2));
          } else {
            components[tagName].props.push(attrName);
          }
        }
      });
    }
  }
}

function collectUsings(path, components, componentsNameMap, usings, filePath, t) {
  const { specifiers } = path.node;
  for (let specifier of specifiers) {
    const tagName = specifier.local.name;
    const componentInfo = components[tagName];
    if (componentInfo) {
      // Generate a random tag name
      const replacedTagName = /[A-Z]/.test(tagName) ? getTagName(tagName) : tagName;
      if (!usings[replacedTagName]) {
        usings[replacedTagName] = { props: [], events: [], children: []};
      }
      usings[replacedTagName] = {
        path: filePath,
        props: [...new Set(componentInfo.props.concat(usings[replacedTagName].props))],
        events: [...new Set(componentInfo.events.concat(usings[replacedTagName].events))],
        children: []
      };
      componentsNameMap.set(tagName, replacedTagName);
      // Use const Custom = 'c90589c' replace import Custom from '../public/xxx or plugin://...'
      path.replaceWith(
        t.VariableDeclaration('const', [
          t.VariableDeclarator(
            t.identifier(tagName),
            t.stringLiteral(replacedTagName)
          ),
        ])
      );
      break;
    } else {
      path.remove();
    }
  }
}

function scanSlot(componentsNameMap, usings,  t) {
  return (path) => {
    const { name } = path.node;
    if (componentsNameMap.has(name.name)) {
      const replacedTagName = componentsNameMap.get(name.name);
      path.parent.children
        .filter(child => !t.isJSXText(child))
        .forEach((child) => {
          if (t.isJSXElement(child)) {
            const childOpeningElement = child.openingElement;
            const childAttributes = childOpeningElement.attributes;
            const slotAttribute = childAttributes.find(attr => attr.name && attr.name.name === 'slot');
            const slotInfo = slotAttribute ? { slot: slotAttribute.value.value } : {};
            usings[replacedTagName].children.push(slotInfo);
          } else {
            usings[replacedTagName].children.push({});
          }
        }
        );
    }
  }
}

module.exports ={
  collectComponentAttr,
  collectUsings,
  scanSlot
}
