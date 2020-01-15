'use strict';

var imageSize = require('image-size');

var mimes = require('../mimes.json');

function getMime(path) {
  var extension = path.split('.').pop().toLowerCase();
  var mime = mimes[extension];

  if (!mime) {
    throw new Error('Unsupported type of image of extension ' + extension + ': ' + path);
  }

  return mime;
}

module.exports = function base64ImageLoader(content) {
  this.cacheable && this.cacheable();
  var dimensions = {};

  try {
    var _dimensions = imageSize(content);

    Object.assign(dimensions, _dimensions);
  } catch (err) {}

  return "module.exports = {\n    uri: \"data:" + getMime(this.resourcePath) + ";base64," + content.toString('base64') + "\",\n    width: " + (dimensions.width || 'undefined') + ",\n    height: " + (dimensions.height || 'undefined') + "\n  }";
};

module.exports.raw = true;