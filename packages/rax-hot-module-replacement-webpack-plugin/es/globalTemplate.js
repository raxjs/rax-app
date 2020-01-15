const Template = require('./Template');

const XMLHttpRequestRuntime = Template.getFunctionContent(require('./polyfill/XMLHttpRequest'));

module.exports = `\nvar global;\n\nif (typeof window !== 'undefined') {\n  global = window;\n} else if (typeof global !== 'undefined') {\n  global = global;\n} else if (typeof self !== 'undefined') {\n  global = self;\n} else {\n  global = {};\n};\n\n\n// reload polyfill\nvar isWeex = typeof callNative === 'function';\n\nif (isWeex && typeof location.reload === 'undefined') {\n  var LOCATION_MODULE = '@weex-module/location';\n\n  location.reload = function(forceReload) {\n    var weexLocation = require(LOCATION_MODULE);\n    weexLocation.reload(forceReload);\n  };\n};\n\nif (typeof XMLHttpRequest === 'undefined') {\n  ${  XMLHttpRequestRuntime  }\n}\n`;