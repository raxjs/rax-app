/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/



const Template = require('./Template');

const JsonpMainTemplatePlugin =
/* #__PURE__ */
function () {
  function JsonpMainTemplatePlugin() {}

  const _proto = JsonpMainTemplatePlugin.prototype;

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
    hash.update(`${  this.outputOptions.filename}`);
    hash.update(`${  this.outputOptions.chunkFilename}`);
    hash.update(`${  this.outputOptions.jsonpFunction}`);
    hash.update(`${  this.outputOptions.hotUpdateFunction}`);
  };

  _proto.onBootstrap = function onBootstrap(source, chunk, hash) {
    const _this = this;

    const hotUpdateChunkFilename = this.outputOptions.hotUpdateChunkFilename;
    const hotUpdateMainFilename = this.outputOptions.hotUpdateMainFilename;
    const hotUpdateFunction = this.outputOptions.hotUpdateFunction;
    const currentHotUpdateChunkFilename = this.applyPluginsWaterfall('asset-path', JSON.stringify(hotUpdateChunkFilename), {
      hash: `" + ${  this.renderCurrentHashCode(hash)  } + "`,
      hashWithLength: function hashWithLength(length) {
        return `" + ${  _this.renderCurrentHashCode(hash, length)  } + "`;
      },
      chunk: {
        id: '" + chunkId + "',
      },
    });
    const currentHotUpdateMainFilename = this.applyPluginsWaterfall('asset-path', JSON.stringify(hotUpdateMainFilename), {
      hash: `" + ${  this.renderCurrentHashCode(hash)  } + "`,
      hashWithLength: function hashWithLength(length) {
        return `" + ${  _this.renderCurrentHashCode(hash, length)  } + "`;
      },
    });
    const runtimeSource = Template.getFunctionContent(require('./RaxJsonpMainTemplate.runtime.js')).replace(/\/\/\$semicolon/g, ';').replace(/\$require\$/g, this.requireFn).replace(/\$hotMainFilename\$/g, currentHotUpdateMainFilename).replace(/\$hotChunkFilename\$/g, currentHotUpdateChunkFilename).replace(/\$hash\$/g, JSON.stringify(hash));
    return `${source  }\nfunction hotDisposeChunk(chunkId) {\ndelete installedChunks[chunkId];\n}\nvar parentHotUpdateCallback = global[${  JSON.stringify(hotUpdateFunction)  }];\nglobal[${  JSON.stringify(hotUpdateFunction)  }] = ${  runtimeSource}`;
  };

  return JsonpMainTemplatePlugin;
}();

module.exports = JsonpMainTemplatePlugin;