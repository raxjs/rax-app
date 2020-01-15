

import css from 'css';
import loaderUtils from 'loader-utils';
import transformer from './transformer';
import { getErrorMessages, getWarnMessages, resetMessage } from './promptMessage';

const RULE = 'rule';
const FONT_FACE_RULE = 'font-face';
const MEDIA_RULE = 'media';
const QUOTES_REG = /['|"]/g;

module.exports = function (source) {
  this.cacheable && this.cacheable();
  const stylesheet = css.parse(source).stylesheet;

  if (stylesheet.parsingErrors.length) {
    throw new Error('StyleSheet Parsing Error occured.');
  } // getOptions can return null if no query passed.


  const parsedQuery = loaderUtils.getOptions(this) || {}; // Compatible with string true.

  if (parsedQuery.log === 'true') {
    parsedQuery.log = true;
  }

  const parsedData = parse(parsedQuery, stylesheet);
  return genStyleContent(parsedData, parsedQuery);
};

var parse = function parse(parsedQuery, stylesheet) {
  const styles = {};
  const fontFaceRules = [];
  const mediaRules = [];
  const transformDescendantCombinator = parsedQuery.transformDescendantCombinator;
  stylesheet.rules.forEach(function (rule) {
    let style = {}; // normal rule

    if (rule.type === RULE) {
      style = transformer.convert(rule, parsedQuery.log);
      rule.selectors.forEach(function (selector) {
        let sanitizedSelector = transformer.sanitizeSelector(selector, transformDescendantCombinator, rule.position, parsedQuery.log);

        if (sanitizedSelector) {
          // handle pseudo class
          const pseudoIndex = sanitizedSelector.indexOf(':');

          if (pseudoIndex > -1) {
            const pseudoStyle = {};
            const pseudoName = selector.slice(pseudoIndex + 1);
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
      const font = {};
      rule.declarations.forEach(function (declaration) {
        font[declaration.property] = declaration.value;
      });
      fontFaceRules.push(font);
    } // media rule


    if (rule.type === MEDIA_RULE) {
      mediaRules.push({
        key: rule.media,
        data: parse(parsedQuery, rule).data,
      });
    }
  });
  return {
    styles,
    fontFaceRules,
    mediaRules,
  };
};

var genStyleContent = function genStyleContent(parsedData, parsedQuery) {
  const styles = parsedData.styles;
  const fontFaceRules = parsedData.fontFaceRules;
  const mediaRules = parsedData.mediaRules;
  const fontFaceContent = getFontFaceContent(fontFaceRules);
  const mediaContent = getMediaContent(mediaRules);
  const warnMessageOutput = parsedQuery.log ? getWarnMessageOutput() : '';
  resetMessage();
  return `var _styles = ${  stringifyData(styles)  };\n  ${  fontFaceContent  }\n  ${  mediaContent  }\n  ${  warnMessageOutput  }\n  module.exports = _styles;\n  `;
};

var getWarnMessageOutput = function getWarnMessageOutput() {
  const errorMessages = getErrorMessages();
  const warnMessages = getWarnMessages();
  let output = '';

  if (errorMessages) {
    output += `\n  if (process.env.NODE_ENV !== 'production') {\n    console.error('${  errorMessages  }');\n  }\n    `;
  }

  if (warnMessages) {
    output += `\n  if (process.env.NODE_ENV !== 'production') {\n    console.warn('${  warnMessages  }');\n  }\n    `;
  }

  return output;
};

var getMediaContent = function getMediaContent(mediaRules) {
  let content = '';
  mediaRules.forEach(function (rule, index) {
    content += `\n  if (window.matchMedia && window.matchMedia('${  rule.key  }').matches) {\n    var ruleData = ${  stringifyData(rule.data)  };\n    for(var key in ruleData) {\n      _styles[key] = Object.assign(_styles[key], ruleData[key]);\n    }\n  }\n    `;
  });
  return content;
};

var getFontFaceContent = function getFontFaceContent(rules) {
  let content = '';

  if (rules.length > 0) {
    content += "\n  if (typeof FontFace === 'function') {\n    ";
  }

  rules.forEach(function (rule, index) {
    content += `\n    var fontFace${  index  } = new FontFace('${  rule['font-family'].replace(QUOTES_REG, '')  }', '${  rule.src.replace(QUOTES_REG, '')  }');\n    document.fonts.add(fontFace${  index  });\n    `;
  });

  if (rules.length > 0) {
    content += "\n  }\n    ";
  }

  return content;
};

var stringifyData = function stringifyData(data) {
  return JSON.stringify(data, undefined, '  ');
};