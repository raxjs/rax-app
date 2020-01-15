/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
'use strict';

var Template = require('./Template');

var JsonpMainTemplatePlugin =
/*#__PURE__*/
function () {
  function JsonpMainTemplatePlugin() {}

  var _proto = JsonpMainTemplatePlugin.prototype;

  _proto.apply = function apply(mainTemplate) {
    try {
      mainTemplate.hooks.hotBootstrap.tap('RaxJsonpMainTemplatePlugin', this.onBootstrap);
      mainTemplate.hooks.hash.tap('RaxJsonpMainTemplatePlugin', this.onHash);
    } catch (e) {
      mainTemplate.plugin('bootstrap', this.onBootstrap);
      mainTemplate.plugin('hash', this.onHash);
    }
  };

  _proto.onHash = function onHash(hash) {
    hash.update('jsonp');
    hash.update('4');
    hash.update("" + this.outputOptions.filename);
    hash.update("" + this.outputOptions.chunkFilename);
    hash.update("" + this.outputOptions.jsonpFunction);
    hash.update("" + this.outputOptions.hotUpdateFunction);
  };

  _proto.onBootstrap = function onBootstrap(source, chunk, hash) {
    var _this = this;

    var hotUpdateChunkFilename = this.outputOptions.hotUpdateChunkFilename;
    var hotUpdateMainFilename = this.outputOptions.hotUpdateMainFilename;
    var hotUpdateFunction = this.outputOptions.hotUpdateFunction;
    var currentHotUpdateChunkFilename = this.applyPluginsWaterfall('asset-path', JSON.stringify(hotUpdateChunkFilename), {
      hash: "\" + " + this.renderCurrentHashCode(hash) + " + \"",
      hashWithLength: function hashWithLength(length) {
        return "\" + " + _this.renderCurrentHashCode(hash, length) + " + \"";
      },
      chunk: {
        id: '" + chunkId + "'
      }
    });
    var currentHotUpdateMainFilename = this.applyPluginsWaterfall('asset-path', JSON.stringify(hotUpdateMainFilename), {
      hash: "\" + " + this.renderCurrentHashCode(hash) + " + \"",
      hashWithLength: function hashWithLength(length) {
        return "\" + " + _this.renderCurrentHashCode(hash, length) + " + \"";
      }
    });
    var runtimeSource = Template.getFunctionContent(require('./RaxJsonpMainTemplate.runtime.js')).replace(/\/\/\$semicolon/g, ';').replace(/\$require\$/g, this.requireFn).replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename).replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename).replace(/\$hash\$/g, JSON.stringify(hash));
    return source + "\nfunction hotDisposeChunk(chunkId) {\ndelete installedChunks[chunkId];\n}\nvar parentHotUpdateCallback = global[" + JSON.stringify(hotUpdateFunction) + "];\nglobal[" + JSON.stringify(hotUpdateFunction) + "] = " + runtimeSource;
  };

  return JsonpMainTemplatePlugin;
}();

module.exports = JsonpMainTemplatePlugin;