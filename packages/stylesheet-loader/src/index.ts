import * as css from 'css';
import * as loaderUtils from 'loader-utils';
import transformer from './transformer';
import globalCSSVariable from './globalCSSVariable';
import { getErrorMessages, getWarnMessages, resetMessage } from './promptMessage';
import { isPrefersColorScheme, processPrefersColorScheme } from './processPrefersColorScheme';

const RULE = 'rule';
const FONT_FACE_RULE = 'font-face';
const MEDIA_RULE = 'media';
const QUOTES_REG = /['|"]/g;
// example "color: var(--name);" search string "var(" and ")"
const VAR_KEY_VAL_REG = /"(.*?)"\s*:\s*"var\((.*)\)"/g;
const GLOBAL_CSS_VAR = '__CSSVariables';
const CSS_VAR_NAME = ':root';

function styleSheetLoader(source) {
  const self = typeof this === 'object' ? this : {};
  self.cacheable && self.cacheable();

  const { stylesheet } = css.parse(source);

  if (stylesheet.parsingErrors.length) {
    throw new Error('StyleSheet Parsing Error occured.');
  }

  // getOptions can return null if no query passed.
  const parsedQuery = loaderUtils.getOptions(self) || {};

  // Compatible with string true.
  if (parsedQuery.log === 'true') {
    parsedQuery.log = true;
  }

  const parsedData = parse(parsedQuery, stylesheet);

  return genStyleContent(parsedData, parsedQuery);
}

export const parse = (parsedQuery, stylesheet) => {
  const styles = {};
  const fontFaceRules = [];
  const mediaRules = [];
  const { transformDescendantCombinator } = parsedQuery;

  stylesheet.rules.forEach((rule) => {
    let style = {};

    // normal rule
    if (rule.type === RULE) {
      style = transformer.convert(rule, parsedQuery);

      rule.selectors.forEach((selector) => {
        let sanitizedSelector = transformer.sanitizeSelector(selector, transformDescendantCombinator, rule.position, parsedQuery.log);
        if (sanitizedSelector) {
          // handle pseudo class
          const pseudoIndex = sanitizedSelector.indexOf(':');
          if (pseudoIndex > -1 && !parsedQuery.theme) {
            const pseudoStyle = {};
            const pseudoName = selector.slice(pseudoIndex + 1);
            sanitizedSelector = sanitizedSelector.slice(0, pseudoIndex);

            Object.keys(style).forEach((prop) => {
              pseudoStyle[prop + pseudoName] = style[prop];
            });

            style = pseudoStyle;
          }
          // eslint-disable-next-line eqeqeq
          if (sanitizedSelector == CSS_VAR_NAME && parsedQuery.theme) {
            sanitizedSelector = GLOBAL_CSS_VAR;
          }

          styles[sanitizedSelector] = Object.assign(styles[sanitizedSelector] || {}, style);
        }
      });
    }

    // font face rule
    if (rule.type === FONT_FACE_RULE) {
      const font = {};
      rule.declarations.forEach((declaration) => {
        font[declaration.property] = declaration.value;
      });
      fontFaceRules.push(font);
    }

    // media rule
    if (rule.type === MEDIA_RULE) {
      mediaRules.push({
        key: rule.media,
        data: parse(parsedQuery, rule).styles,
      });
    }
  });

  return {
    styles,
    fontFaceRules,
    mediaRules,
  };
};

const genStyleContent = (parsedData, parsedQuery) => {
  const { fontFaceRules, mediaRules } = parsedData;
  const styles = processPrefersColorScheme(mediaRules, parsedData.styles, parsedQuery.taskName);

  const fontFaceContent = getFontFaceContent(fontFaceRules);
  const mediaContent = getMediaContent(mediaRules, parsedQuery);
  const warnMessageOutput = parsedQuery.log ? getWarnMessageOutput() : '';
  resetMessage();
  return `${parsedQuery.theme ? globalCSSVariable({ styles, globalCSSVarName: GLOBAL_CSS_VAR }) : ''}
  var _styles = ${stringifyData(styles, parsedQuery.theme)};
${fontFaceContent}
${mediaContent}
${warnMessageOutput}
  module.exports = _styles;
  `;
};

const getWarnMessageOutput = () => {
  const errorMessages = getErrorMessages();
  const warnMessages = getWarnMessages();
  let output = '';

  if (errorMessages) {
    output += `
  if (process.env.NODE_ENV !== 'production') {
    console.error('${errorMessages}');
  }
    `;
  }
  if (warnMessages) {
    output += `
  if (process.env.NODE_ENV !== 'production') {
    console.warn('${warnMessages}');
  }
    `;
  }

  return output;
};

const getMediaContent = (mediaRules, parsedQuery) => {
  let content = '';

  mediaRules.forEach((rule) => {
    // Weex no need to process prefers-color-scheme media
    if (parsedQuery.taskName !== 'weex' || !isPrefersColorScheme(rule.key)) {
      content += `
  if (window.matchMedia && window.matchMedia('${rule.key}').matches) {
    var ruleData = ${stringifyData(rule.data)};
    for(var key in ruleData) {
      _styles[key] = Object.assign(_styles[key] || {}, ruleData[key]);
    }
  }
    `;
    }
  });

  return content;
};

export const getFontFaceContent = (rules) => {
  let content = '';

  if (rules.length > 0) {
    content += `
  if (typeof FontFace === 'function') {
    `;
  }

  rules.forEach((rule, index) => {
    content += `
    var fontFace${index} = new FontFace('${rule['font-family'].replace(QUOTES_REG, '')}', '${rule.src.replace(QUOTES_REG, '"')}');
    document.fonts.add(fontFace${index});
    `;
  });

  if (rules.length > 0) {
    content += `
  }
    `;
  }
  return content;
};

const stringifyData = (data, theme?) => {
  const str = JSON.stringify(data, undefined, '  ');
  return !theme ? str : str.replace(VAR_KEY_VAL_REG, 'get $1(){return __getValue("$2")}');
};

export default styleSheetLoader;
