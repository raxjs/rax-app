'use strict';

var Rax = require('rax');

var _require = require('react-proxy'),
    createProxy = _require.createProxy;

var global = require('global');

var ComponentMap =
/*#__PURE__*/
function () {
  function ComponentMap(useWeakMap) {
    if (useWeakMap) {
      this.wm = new WeakMap();
    } else {
      this.slots = {};
    }
  }

  var _proto = ComponentMap.prototype;

  _proto.getSlot = function getSlot(type) {
    var key = type.displayName || type.name || 'Unknown';

    if (!this.slots[key]) {
      this.slots[key] = [];
    }

    return this.slots[key];
  };

  _proto.get = function get(type) {
    if (this.wm) {
      return this.wm.get(type);
    }

    var slot = this.getSlot(type);

    for (var i = 0; i < slot.length; i++) {
      if (slot[i].key === type) {
        return slot[i].value;
      }
    }

    return undefined;
  };

  _proto.set = function set(type, value) {
    if (this.wm) {
      this.wm.set(type, value);
    } else {
      var slot = this.getSlot(type);

      for (var i = 0; i < slot.length; i++) {
        if (slot[i].key === type) {
          slot[i].value = value;
          return;
        }
      }

      slot.push({
        key: type,
        value: value
      });
    }
  };

  _proto.has = function has(type) {
    if (this.wm) {
      return this.wm.has(type);
    }

    var slot = this.getSlot(type);

    for (var i = 0; i < slot.length; i++) {
      if (slot[i].key === type) {
        return true;
      }
    }

    return false;
  };

  return ComponentMap;
}();

var proxiesByID;
var didWarnAboutID;
var hasCreatedElementsByType;
var idsByType;
var hooks = {
  register: function register(type, uniqueLocalName, fileName) {
    if (typeof type !== 'function') {
      return;
    }

    if (!uniqueLocalName || !fileName) {
      return;
    }

    if (typeof uniqueLocalName !== 'string' || typeof fileName !== 'string') {
      return;
    }

    var id = fileName + '#' + uniqueLocalName; // eslint-disable-line prefer-template

    if (!idsByType.has(type) && hasCreatedElementsByType.has(type)) {
      if (!didWarnAboutID[id]) {
        didWarnAboutID[id] = true;
        var baseName = fileName.replace(/^.*[\\\/]/, '');
        console.error("Rax Hot Loader: " + uniqueLocalName + " in " + fileName + " will not hot reload " + ("correctly because " + baseName + " uses <" + uniqueLocalName + " /> during ") + ("module definition. For hot reloading to work, move " + uniqueLocalName + " ") + ("into a separate file and import it from " + baseName + "."));
      }

      return;
    } // Remember the ID.


    idsByType.set(type, id); // console.log(id, proxiesByID[id], type);
    // We use React Proxy to generate classes that behave almost
    // the same way as the original classes but are updatable with
    // new versions without destroying original instances.

    if (!proxiesByID[id]) {
      proxiesByID[id] = createProxy(type);
    } else {
      proxiesByID[id].update(type);
    }
  },
  reset: function reset(useWeakMap) {
    proxiesByID = {};
    didWarnAboutID = {};
    hasCreatedElementsByType = new ComponentMap(useWeakMap);
    idsByType = new ComponentMap(useWeakMap);
  }
};
hooks.reset(typeof WeakMap === 'function');

function resolveType(type) {
  // We only care about composite components
  if (typeof type !== 'function') {
    return type;
  }

  hasCreatedElementsByType.set(type, true); // When available, give proxy class to React instead of the real class.

  var id = idsByType.get(type);

  if (!id) {
    return type;
  }

  var proxy = proxiesByID[id];

  if (!proxy) {
    return type;
  }

  return proxy.get();
}

var createElement = Rax.createElement;

function patchedCreateElement(type) {
  // Trick React into rendering a proxy so that
  // its state is preserved when the class changes.
  // This will update the proxy if it's for a known type.
  var resolvedType = resolveType(type);

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return createElement.apply(void 0, [resolvedType].concat(args));
}

patchedCreateElement.isPatchedByReactHotLoader = true;

function patchedCreateFactory(type) {
  // Patch Rax.createFactory to use patched createElement
  // because the original implementation uses the internal,
  // unpatched ReactElement.createElement
  var factory = patchedCreateElement.bind(null, type);
  factory.type = type;
  return factory;
}

patchedCreateFactory.isPatchedByReactHotLoader = true;

if (typeof global.__RAX_HOT_LOADER__ === 'undefined') {
  Rax.createElement = patchedCreateElement;
  Rax.createFactory = patchedCreateFactory;
  global.__RAX_HOT_LOADER__ = hooks;
}