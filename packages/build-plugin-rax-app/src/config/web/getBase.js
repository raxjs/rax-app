const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const DocumentPlugin = require('../../plugins/DocumentPlugin/');
const getWebpackBase = require('../getWebpackBase');
const setEntry = require('../setEntry');
const { WEB } = require('../../constants');

module.exports = (context, target, options = {}) => {
  const config = getWebpackBase(context, {}, WEB);
  setEntry(config, context, WEB);

  config.output.filename(`${WEB}/[name].js`);

  config.plugin('document')
    .use(DocumentPlugin, [{
      context,
      pages: [{
        entryName: 'index',
        path: '/'
      }],
      doctype: options.doctype,
      staticExport: options.staticExport
    }]);

  config
    .plugin('progress-bar')
    .use(ProgressBarPlugin, [{
      clear: false
    }]);

  return config;
};
