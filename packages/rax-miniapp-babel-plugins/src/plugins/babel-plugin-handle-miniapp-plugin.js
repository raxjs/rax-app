const getTagName = require('../utils/getTagName');

const MINIAPP_PLUGIN_COMPONENTS_REG = /^plugin\:\/\//;

module.exports = function visitor(
  { types: t },
  { usingPlugins }
) {
  // Collect imported dependencies
  const plugins = {};
  const pluginNameMap = new Map();
  const scanedFileMap = {};

  return {
    visitor: {
      ImportDeclaration: {
        enter(path, { filename }) {
          const { specifiers, source } = path.node;
          if (t.isStringLiteral(source) && MINIAPP_PLUGIN_COMPONENTS_REG.test(source.value)) {
            if (!scanedFileMap[filename]) {
              scanedFileMap[filename] = true;
              path.parentPath.traverse({
                JSXOpeningElement(innerPath) {
                  const { node: innerNode } = innerPath;
                  if (t.isJSXIdentifier(innerNode.name)) {
                    const tagName = innerNode.name.name;
                    if (!plugins[tagName]) {
                      plugins[tagName] = {
                        props: [],
                        events: []
                      };
                    }
                    innerNode.attributes.forEach((attrNode) => {
                      if (!t.isJSXIdentifier(attrNode.name)) return;
                      const attrName = attrNode.name.name;
                      if (
                        !plugins[tagName].props.includes(attrName) &&
                        !plugins[tagName].events.includes(attrName)
                      ) {
                        // If it starts with 'on', it must be an event handler
                        if (/^on/.test(attrName)) {
                          plugins[tagName].events.push(attrName.slice(2));
                        } else {
                          plugins[tagName].props.push(attrName);
                        }
                      }
                    });
                  }
                },
              });
            }

            for (let specifier of specifiers) {
              const tagName = specifier.local.name;
              const pluginInfo = plugins[tagName];
              if (pluginInfo) {
                // Generate a random tag name
                const replacedTagName = /[A-Z]/.test(tagName) ? getTagName(tagName) : tagName;
                if (!usingPlugins[replacedTagName]) {
                  usingPlugins[replacedTagName] = { props: [], events: [], children: [] };
                }
                usingPlugins[replacedTagName] = {
                  path: source.value,
                  props: [...new Set(pluginInfo.props.concat(usingPlugins[replacedTagName].props))],
                  events: [...new Set(pluginInfo.events.concat(usingPlugins[replacedTagName].events))],
                  children: []
                };
                pluginNameMap.set(tagName, replacedTagName);
                // Use const PluginComp = 'c90589c' replace import PluginComp from 'plugin://...'
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
        },
      },
      JSXOpeningElement: {
        exit(path) {
          const { name } = path.node;
          if (pluginNameMap.has(name.name)) {
            const replacedTagName = pluginNameMap.get(name.name);
            path.parent.children
              .filter(child => t.isJSXElement(child))
              .forEach((child) => {
                const childOpeningElement = child.openingElement;
                const childAttributes = childOpeningElement.attributes;
                const slotAttribute = childAttributes.find(attr => attr.name && attr.name.name === 'slot');
                const slotInfo = slotAttribute ? { slot: slotAttribute.value.value } : {};
                usingPlugins[replacedTagName].children.push(slotInfo);
              }
            );
          }
        }
      },
    },
  };
};
