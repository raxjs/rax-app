// Note: only detect `import x from 'rax-x'`, require is not supported

const TO_RAX_VIEW_PROPS = 'toRaxViewProps';
const TO_RAX_TEXT_PROPS = 'toRaxTextProps';

module.exports = function ({ types: t, template }) {
  const buildToRaxTextProps = template(`
    const transformProps = function (props) {
      const {
        className,
        style = {},
        numberOfLines,
        ...rest
      } = props;

      const prefixCls = 'rax-text-v2';
      const lines =
        typeof numberOfLines === 'string'
          ? parseInt(numberOfLines, 10)
          : numberOfLines;

      let classNames = [prefixCls, className];
      if (lines) {
        classNames.push(prefixCls + '--overflow-hidden');
        if (lines === 1) {
          classNames.push(prefixCls + '--singleline');
        } else {
          classNames.push(prefixCls + '--multiline');
        }
      }

      const lineClamp = lines > 1 ? lines : undefined;

      return {
        ...rest,
        className: classNames.filter(Boolean).join( ' ' ),
        style: {
          ...style,
          WebkitLineClamp: lineClamp,
          lineClamp: lineClamp
        }
      };
    }
  `);

  const buildToRaxViewProps = template(`
    const transformProps = function (props) {
      const {
        className,
        style = {},
        ...rest
      } = props;

      return {
        ...rest,
        className: className ?
          ( 'rax-view-v2 ' + className ) :
          'rax-view-v2',
        style: style
      };
    }
  `);

  return {
    visitor: {
      Program: {
        enter() {
          this._raxAtomicIds = new Map();
        },
        exit(path) {
          [
            {
              id: TO_RAX_TEXT_PROPS,
              init: buildToRaxTextProps().declarations[0].init,
            },
            {
              id: TO_RAX_VIEW_PROPS,
              init: buildToRaxViewProps().declarations[0].init,
            },
          ].forEach(({ id, init }) => {
            if (this._raxAtomicIds.has(id)) {
              path.scope.push({
                id: this._raxAtomicIds.get(id),
                init,
              });
            }
          });

          this._raxAtomicIds = null;
        },
      },
      JSXElement: {
        enter(path) {
          const openingPath = path.get('openingElement');
          const tag = openingPath.node.name;
          const tagName = tag.name;

          if (t.react.isCompatTag(tagName)) {
            return;
          }

          const source = findImportSourceForJSXIdentifier(path, tagName);

          if (source === 'rax-view') {
            transformRaxView.call(this, path, t);
          } else if (source === 'rax-text') {
            transformRaxText.call(this, path, t);
          }
        },
      },
    },
  };
};

function addAtomicId(path, ids, id) {
  if (!ids.has(id)) {
    ids.set(id, generateIdentifierInProgramScope(path, id));
  }
}

function generateIdentifierInProgramScope(path, id = '') {
  const programScope = path.scope.getProgramParent();
  return programScope.generateUidIdentifier(id);
}

function hasJSXSpreadAttribute(attributes = []) {
  return attributes.some((attribute) => {
    return attribute.isJSXSpreadAttribute();
  });
}

function removeAttributes(attributes, names = []) {
  attributes.forEach((attribute) => {
    const name = getJSXAttributeName(attribute);
    if (
      attribute.isJSXAttribute() &&
      names.includes(name)
    ) {
      attribute.remove();
    }
  });
}

function spreadAttributes(path, t, id) {
  // exclude x-、dangerouslySetInnerHTML
  const {
    object,
    excludes,
  } = jsxAttributesToObjectExpression(path, t, {
    exclude: excludeProp,
  });

  path.node.openingElement.attributes = [
    ...excludes,
    t.jsxSpreadAttribute(
      t.callExpression(
        id,
        [
          object,
        ],
      ),
    ),
  ];
}

function excludeProp(propName = '') {
  return propName.startsWith('x-') ||
    propName === 'dangerouslySetInnerHTML';
}

function jsxAttributesToObjectExpression(path, t, options = {}) {
  const { only, exclude } = options;

  const attributePaths = path.get('openingElement.attributes');

  const excludes = [];

  // eslint-disable-next-line array-callback-return
  const properties = attributePaths.map((attributePath) => {
    // <el { ...expr }>
    if (attributePath.isJSXSpreadAttribute()) {
      return t.spreadElement(
        attributePath.node.argument,
      );
    }

    if (attributePath.isJSXAttribute()) {
      const name = getJSXAttributeName(attributePath);
      const valuePath = attributePath.get('value');

      if (only && (only(name) === false)) {
        return;
      }

      if (exclude && exclude(name)) {
        excludes.push(attributePath.node);
        return;
      }

      // no value, e.g. <el attr />, use t.booleanLiteral(true)
      return t.objectProperty(
        t.stringLiteral(name),
        attributePath.node.value ?
          getJSXAttributeValueExpression(valuePath) :
          t.booleanLiteral(true),
      );
    }

    excludes.push(attributePath.node);
  }).filter(Boolean);

  return {
    object: t.objectExpression(properties),
    excludes,
  };
}

function getJSXAttributeName(attributePath) {
  if (!attributePath.isJSXAttribute()) {
    return;
  }

  const namePath = attributePath.get('name');
  if (namePath.isJSXIdentifier()) {
    return namePath.node.name;
  }

  if (namePath.isJSXNamespacedName()) {
    return `${ namePath.node.namespace.name }:${ namePath.node.name.name }`;
  }
}

function getJSXAttributeValueExpression(valuePath) {
  if (valuePath.isJSXExpressionContainer()) {
    return valuePath.node.expression;
  }

  return valuePath.node;
}

// rax-text start
function transformRaxText(path, t) {
  changeTagName(path, 'span');

  const attributes = path.get('openingElement.attributes');

  addAtomicId(path, this._raxAtomicIds, TO_RAX_TEXT_PROPS);

  if (attributes.length > 0) {
    if (hasJSXSpreadAttribute(attributes)) {
      spreadAttributes(path, t, this._raxAtomicIds.get(TO_RAX_TEXT_PROPS));
    } else {
      // TODO: find numberOfLines -> toRaxTextProps
      const names = ['className', 'style', 'numberOfLines'];
      const {
        object,
      } = jsxAttributesToObjectExpression(path, t, {
        only(name) {
          return names.includes(name);
        },
      });

      removeAttributes(attributes, names);

      path.node.openingElement.attributes.unshift(
        t.jsxSpreadAttribute(
          t.callExpression(
            this._raxAtomicIds.get(TO_RAX_TEXT_PROPS),
            [
              object,
            ],
          ),
        ),
      );
    }
  } else {
    // no attribute
    path.node.openingElement.attributes.unshift(
      t.jsxSpreadAttribute(
        t.callExpression(
          this._raxAtomicIds.get(TO_RAX_TEXT_PROPS),
          [
            t.ObjectExpression([]),
          ],
        ),
      ),
    );
  }

  const children = path.get('children') || [];

  children.forEach((child) => {
    if (child.isJSXElement()) {
      child.replaceWith(t.jsxText('[object Object]'));
    }
  });
}
// rax-text end

// rax-view start
function transformRaxView(path, t) {
  changeTagName(path, 'div');

  const attributes = path.get('openingElement.attributes');

  if (attributes.length > 0) {
    if (hasJSXSpreadAttribute(attributes)) {
      addAtomicId(path, this._raxAtomicIds, TO_RAX_VIEW_PROPS);
      spreadAttributes(path, t, this._raxAtomicIds.get(TO_RAX_VIEW_PROPS));
    } else {
      prefixClassName(path, t, 'rax-view-v2');
    }
  } else {
    // no attribute
    prefixClassName(path, t, 'rax-view-v2');
  }
}

function changeTagName(path, tagName = '') {
  if (!tagName) {
    return;
  }

  const { openingElement } = path.node;
  const closeingElement = path.node.closingElement;

  openingElement.name.name = tagName;

  if (openingElement.selfClosing === true) {
    return;
  }

  closeingElement.name.name = tagName;
}

// - cannot find attribute "className" -> className="prefixedClassName"
// - className (no value provided) -> className="prefixedClassName"
// - className={ null } ("NullLiteral") -> className="prefixedClassName string"
// - className="string" -> className="prefixedClassName string" }
// - className={ expression } -> className={ 'prefixedClassName' + ( expression ) }
// - others: warning
function prefixClassName(path, t, className = '') {
  const valuePath = findJSXAttributeValuePath(path, 'className');

  if (!valuePath) {
    path.node.openingElement.attributes = [
      t.jsxAttribute(
        t.jsxIdentifier('className'),
        t.stringLiteral(className),
      ),
    ];
    return;
  }

  if (valuePath.isStringLiteral()) {
    valuePath.replaceWith(
      t.stringLiteral(`${className } ${ valuePath.node.value}`),
    );
  } else if (valuePath.isJSXExpressionContainer()) {
    valuePath.replaceWith(
      t.jsxExpressionContainer(
        t.binaryExpression(
          '+',
          t.stringLiteral(`${className } `),
          valuePath.node.expression,
        ),
      ),
    );
  }
}

function findJSXAttributeValuePath(path, name) {
  const jsxAttributePath = findJSXAttributePath(path, name);

  if (!jsxAttributePath) {
    return;
  }

  return jsxAttributePath.get('value');
}

function findJSXAttributePath(path, name) {
  const attributes = path.get('openingElement.attributes') || [];
  return attributes.find((attributePath) => {
    return attributePath.isJSXAttribute() &&
      getJSXAttributeName(attributePath) === name;
  });
}
// rax-view end

// 1. Got 'View'
// 2. Find `import View from 'rax-view'` declaration by traversing parent scope
// 3. Return 'rax-view'
function findImportSourceForJSXIdentifier(path, identifierName) {
  const binding = findBindingInScope(path.scope, identifierName);

  if (!binding) {
    return;
  }

  const bindingPath = binding.path;
  const bindingParentPath = bindingPath.parentPath;

  if (
    bindingPath.isImportDefaultSpecifier() &&
    bindingPath.node.local.name === identifierName &&
    bindingParentPath.isImportDeclaration()
  ) {
    return bindingParentPath.node.source.value;
  }
}

function findBindingInScope(scope = {}, identifierName = '') {
  const bindings = scope.bindings || {};
  const binding = bindings[identifierName];

  if (binding) {
    return binding;
  }

  if (scope.parent) {
    return findBindingInScope(scope.parent, identifierName);
  }
}
