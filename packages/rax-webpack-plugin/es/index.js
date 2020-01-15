import { ConcatSource } from 'webpack-sources';
import { DefinePlugin } from 'webpack';
import ExternalModuleFactoryPlugin from 'webpack/lib/ExternalModuleFactoryPlugin';
import RaxMainTemplatePlugin from './RaxMainTemplatePlugin';
import BuiltinModules from './BuiltinModules';
import MultiplePlatform from './MultiplePlatform';
import DuplicateChecker from './DuplicateChecker';

const isProducation = process.env.NODE_ENV === 'production';
const shouldExternalBuiltinModules = process.env.RAX_EXTERNAL_BUILTIN_MODULES === 'true';

const RaxWebpackPlugin =
/* #__PURE__ */
function () {
  function RaxWebpackPlugin(options) {
    this.options = Object.assign({
      builtinModules: BuiltinModules,
      externalBuiltinModules: shouldExternalBuiltinModules,
      frameworkComment: null,
      includePolyfills: false,
      platforms: [],
      // web node weex reactnative
      polyfillModules: [],
      runModule: false,
      bundle: 'compatible',
      // private
      target: 'umd',
      // default umd
      duplicateCheck: ['rax'],
    }, options);
  }

  const _proto = RaxWebpackPlugin.prototype;

  _proto.applyBanner = function applyBanner(compiler) {
    const defaultFrameworkComment = '// {"framework" : "Rax"}';
    const frameworkComment = typeof this.options.frameworkComment === 'string' ? this.options.frameworkComment : defaultFrameworkComment; // Webpack 4

    if (compiler.hooks && compiler.hooks.compilation && compiler.hooks.compilation.tap) {
      compiler.hooks.compilation.tap('RaxBannerPlugin', function (compilation) {
        // uglify-webpack-plugin will remove javascript's comments in optimizeChunkAssets
        // need use afterOptimizeChunkAssets to add frameworkComment after that.
        // like the else block
        compilation.hooks.afterOptimizeChunkAssets.tap('RaxBannerPlugin', function (chunks) {
          for (var _iterator = chunks, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
              if (_i >= _iterator.length) break;
              _ref = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done) break;
              _ref = _i.value;
            }

            const chunk = _ref;

            // Entry only
            if (!chunk.canBeInitial()) {
              continue;
            }

            chunk.files.forEach(function (file) {
              compilation.assets[file] = new ConcatSource(frameworkComment, '\n', compilation.assets[file]);
            });
          }
        });
      });
    } else {
      compiler.plugin('compilation', function (compilation) {
        // uglify-webpack-plugin will remove javascript's comments in
        // optimize-chunk-assets, add frameworkComment after that.
        compilation.plugin('after-optimize-chunk-assets', function (chunks) {
          chunks.forEach(function (chunk) {
            // Entry only
            try {
              // In webpack2 chunk.initial was removed. Use isInitial()
              if (!chunk.initial) return;
            } catch (e) {
              if (!chunk.isInitial()) return;
            }

            chunk.files.forEach(function (file) {
              compilation.assets[file] = new ConcatSource(frameworkComment, '\n', compilation.assets[file]);
            });
          });
        });
      });
    }
  };

  _proto.apply = function apply(compiler) {
    const _this = this;

    compiler.apply(new DefinePlugin({
      '__DEV__': !isProducation,
    }));
    compiler.apply(new DuplicateChecker({
      modulesToCheck: this.options.duplicateCheck,
    }));
    compiler.plugin('this-compilation', function (compilation) {
      compilation.apply(new RaxMainTemplatePlugin(_this.options));
    });
    compiler.plugin('compile', function (params) {
      params.normalModuleFactory.apply(new ExternalModuleFactoryPlugin('amd', function (context, request, callback) {
        // @weex-module/* ignored
        if (/^@weex\-module\//.test(request)) {
          return callback(null, request, 'commonjs');
        } // @system/* ignored


        if (/^@system\//.test(request)) {
          return callback(null, request, 'commonjs');
        }

        const builtinModuleName = _this.options.builtinModules[request];

        if (_this.options.externalBuiltinModules && builtinModuleName) {
          if (Array.isArray(builtinModuleName)) {
            let customRequest = '(function(){ var mod;';
            builtinModuleName.forEach(function (name) {
              customRequest += `if (!mod) { try { mod = require("${  name  }") } catch(e) {} }`;
            });
            customRequest += 'return mod;})()'; // Custom external format

            return callback(null, customRequest, 'custom-format');
          } else {
            return callback(null, builtinModuleName, 'commonjs');
          }
        }

        callback();
      }));
    });

    if (this.options.target === 'bundle' || this.options.frameworkComment) {
      this.applyBanner(compiler);
    }
  };

  return RaxWebpackPlugin;
}();

RaxWebpackPlugin.BuiltinModules = BuiltinModules;
RaxWebpackPlugin.MultiplePlatform = MultiplePlatform;
module.exports = RaxWebpackPlugin;