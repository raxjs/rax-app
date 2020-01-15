'use strict';

import css from 'css';
import transformer from './transformer';
import loaderUtils from 'loader-utils';
import { getErrorMessages, getWarnMessages, resetMessage } from './promptMessage';
var RULE = 'rule';
var FONT_FACE_RULE = 'font-face';
var MEDIA_RULE = 'media';
var QUOTES_REG = /['|"]/g;

module.exports = function (source) {
  this.cacheable && this.cacheable();
  var stylesheet = css.parse(source).stylesheet;

  if (stylesheet.parsingErrors.length) {
    throw new Error('StyleSheet Parsing Error occured.');
  } // getOptions can return null if no query passed.


  var parsedQuery = loaderUtils.getOptions(this) || {}; // Compatible with string true.

  if (parsedQuery.log === 'true') {
    parsedQuery.log = true;
  }

  var parsedData = parse(parsedQuery, stylesheet);
  return genStyleContent(parsedData, parsedQuery);
};

var parse = function parse(parsedQuery, stylesheet) {
  var styles = {};
  var fontFaceRules = [];
  var mediaRules = [];
  var transformDescendantCombinator = parsedQuery.transformDescendantCombinator;
  stylesheet.rules.forEach(function (rule) {
    var style = {}; // normal rule

    if (rule.type === RULE) {
      style = transformer.convert(rule, parsedQuery.log);
      rule.selectors.forEach(function (selector) {
        var sanitizedSelector = transformer.sanitizeSelector(selector, transformDescendantCombinator, rule.position, parsedQuery.log);

        if (sanitizedSelector) {
          // handle pseudo class
          var pseudoIndex = sanitizedSelector.indexOf(':');

          if (pseudoIndex > -1) {
            var pseudoStyle = {};
            var pseudoName = selector.slice(pseudoIndex + 1);
            sanitizedSelector = sanitizedSelector.slice(0, pseudoIndex);
            Object.keys(style).forEach(function (prop) {
              pseudoStyle[prop + pseudoName] = style[prop];
            });
            style = pseudoStyle;
          }

          styles[sanitizedSelector] = Object.assign(styles[sanitizedSelector] || {}, style);
        }
      });
    } // font face rule


    if (rule.type === FONT_FACE_RULE) {
      var font = {};
      rule.declarations.forEach(function (declaration) {
        font[declaration.property] = declaration.value;
      });
      fontFaceRules.push(font);
    } // media rule


    if (rule.type === MEDIA_RULE) {
      mediaRules.push({
        key: rule.media,
        data: parse(parsedQuery, rule).data
      });
    }
  });
  return {
    styles: styles,
    fontFaceRules: fontFaceRules,
    mediaRules: mediaRules
  };
};

var genStyleContent = function genStyleContent(parsedData, parsedQuery) {
  var styles = parsedData.styles,
      fontFaceRules = parsedData.fontFaceRules,
      mediaRules = parsedData.mediaRules;
  var fontFaceContent = getFontFaceContent(fontFaceRules);
  var mediaContent = getMediaContent(mediaRules);
  var warnMessageOutput = parsedQuery.log ? getWarnMessageOutput() : '';
  resetMessage();
  return "var _styles = " + stringifyData(styles) + ";\n  " + fontFaceContent + "\n  " + mediaContent + "\n  " + warnMessageOutput + "\n  module.exports = _styles;\n  ";
};

var getWarnMessageOutput = function getWarnMessageOutput() {
  var errorMessages = getErrorMessages();
  var warnMessages = getWarnMessages();
  var output = '';

  if (errorMessages) {
    output += "\n  if (process.env.NODE_ENV !== 'production') {\n    console.error('" + errorMessages + "');\n  }\n    ";
  }

  if (warnMessages) {
    output += "\n  if (process.env.NODE_ENV !== 'production') {\n    console.warn('" + warnMessages + "');\n  }\n    ";
  }

  return output;
};

var getMediaContent = function getMediaContent(mediaRules) {
  var content = '';
  mediaRules.forEach(function (rule, index) {
    content += "\n  if (window.matchMedia && window.matchMedia('" + rule.key + "').matches) {\n    var ruleData = " + stringifyData(rule.data) + ";\n    for(var key in ruleData) {\n      _styles[key] = Object.assign(_styles[key], ruleData[key]);\n    }\n  }\n    ";
  });
  return content;
};

var getFontFaceContent = function getFontFaceContent(rules) {
  var content = '';

  if (rules.length > 0) {
    content += "\n  if (typeof FontFace === 'function') {\n    ";
  }

  rules.forEach(function (rule, index) {
    content += "\n    var fontFace" + index + " = new FontFace('" + rule['font-family'].replace(QUOTES_REG, '') + "', '" + rule.src.replace(QUOTES_REG, '') + "');\n    document.fonts.add(fontFace" + index + ");\n    ";
  });

  if (rules.length > 0) {
    content += "\n  }\n    ";
  }

  return content;
};

var stringifyData = function stringifyData(data) {
  return JSON.stringify(data, undefined, '  ');
};