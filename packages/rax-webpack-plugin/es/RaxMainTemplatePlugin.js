import { ConcatSource } from 'webpack-sources';
import fs from 'fs';
import path from 'path';

const RaxMainTemplatePlugin =
/* #__PURE__ */
function () {
  function RaxMainTemplatePlugin(options) {
    this.name = '[name]';
    this.options = options;
  }

  const _proto = RaxMainTemplatePlugin.prototype;

  _proto.onRenderWithEntry = function onRenderWithEntry(mainTemplate, source, chunk, hash) {
    const requireCall = '';
    let polyfills = [];
    let name = ''; // webpack 4 api

    if (mainTemplate.getAssetPath) {
      name = mainTemplate.getAssetPath(this.name, {
        hash,
        chunk,
      });
    } else {
      name = mainTemplate.applyPluginsWaterfall('asset-path', this.name, {
        hash,
        chunk,
      });
    }

    if (this.options.includePolyfills) {
      const polyfillModules = this.options.polyfillModules;
      polyfills = polyfillModules.map(function (fp) {
        return fs.readFileSync(fp, 'utf8');
      });
    }

    const moduleName = this.options.moduleName || name;
    const globalName = this.options.globalName || name;
    const target = this.options.target;
    let sourcePrefix = '';
    let sourceSuffix = '';

    if (typeof this.options.sourcePrefix === 'function' && typeof this.options.sourceSuffix === 'function') {
      sourcePrefix = this.options.sourcePrefix(source, chunk, hash);
      sourceSuffix = this.options.sourceSuffix(source, chunk, hash);
    } else {
      // module, function is private, only use in rax internal
      if (chunk.name.endsWith('.module') || target === 'module') {
        sourcePrefix = 'module.exports = ';
        sourceSuffix = ';';
      } else if (chunk.name.endsWith('.function') || target === 'function') {
        sourcePrefix = "module.exports = function() {\nreturn ";
        sourceSuffix = '};';
      } else if (chunk.name.endsWith('.bundle') || target === 'bundle') {
        // Build page bundle use this mode.
        if (this.options.bundle === 'compatible') {
          sourcePrefix = `define("${  chunk.name  }", function(require) {`;
          sourceSuffix = `}); require("${  chunk.name  }");`;
        } else {
          sourcePrefix = '';
          sourceSuffix = '';
        }
      } else if (chunk.name.endsWith('.factory') || target === 'factory') {
        // Build weex builtin modules use this mode.
        // NOTE: globals should sync logic in weex-rax-framework
        if (this.options.factoryGlobals) {
          const globalsCodes = this.options.factoryGlobals.map(function (name) {
            return `var ${  name  } = this["${  name  }"];`;
          });
          sourcePrefix = `module.exports = function(require, exports, module) {\n${  globalsCodes.join('\n')  }\nmodule.exports = `;
          sourceSuffix = '};';
        } else {
          sourcePrefix = "module.exports = function(require, exports, module) {\nwith(this) { module.exports = ";
          sourceSuffix = '}};';
        }
      } else if (chunk.name.endsWith('.cmd') || target === 'cmd') {
        sourcePrefix = `define(${  JSON.stringify(moduleName)  }, function(require, exports, module){\nmodule.exports = `;
        sourceSuffix = '});';
      } else if (chunk.name.endsWith('.umd') || target === 'umd') {
        // CommonJS first that could rename module name by wrap another define in air
        sourcePrefix = `\n;(function(fn) {\n  if (typeof exports === "object" && typeof module !== "undefined") {\n    module.exports = fn();\n  } else if (typeof define === "function") {\n    define(${  JSON.stringify(moduleName)  }, function(require, exports, module){\n      module.exports = fn();\n    });\n  } else {\n    var root;\n    if (typeof window !== "undefined") {\n      root = window;\n    } else if (typeof self !== "undefined") {\n      root = self;\n    } else if (typeof global !== "undefined") {\n      root = global;\n    } else {\n      // NOTICE: In JavaScript strict mode, this is null\n      root = this;\n    }\n    root["${  globalName  }"] = fn();\n  }\n})(function(){\n  return `;
        sourceSuffix = '});';
      }
    }

    return new ConcatSource(polyfills.join('\n'), sourcePrefix, source, sourceSuffix, requireCall);
  } // webpack 4
  ;

  _proto.applyWithTap = function applyWithTap(compilation) {
    const _this = this;

    const mainTemplate = compilation.mainTemplate;
    mainTemplate.hooks.renderWithEntry.tap('RaxMainTemplatePlugin', this.onRenderWithEntry.bind(this, mainTemplate));
    mainTemplate.hooks.globalHashPaths.tap('RaxMainTemplatePlugin', function (paths) {
      if (_this.name) paths.push(_this.name);
      return paths;
    });
    mainTemplate.hooks.hash.tap('RaxMainTemplatePlugin', function (hash) {
      hash.update('exports rax');
      hash.update(_this.name);
    });
  } // webpack 3
  ;

  _proto.apply = function apply(compilation) {
    const _this2 = this;

    // webpack 4
    if (!compilation.templatesPlugin) {
      return this.applyWithTap(compilation);
    }

    const mainTemplate = compilation.mainTemplate;
    compilation.templatesPlugin('render-with-entry', this.onRenderWithEntry.bind(this, mainTemplate));
    mainTemplate.plugin('global-hash-paths', function (paths) {
      if (_this2.name) paths = paths.concat(_this2.name);
      return paths;
    });
    mainTemplate.plugin('hash', function (hash) {
      hash.update('exports rax');
      hash.update(String(_this2.name));
    });
  };

  return RaxMainTemplatePlugin;
}();

export { RaxMainTemplatePlugin as default };