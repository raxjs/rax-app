import camelCase from 'camelcase';
import chalk from 'chalk';
import normalizeColor from './normalizeColor';
import particular from './particular';
import Validation from './Validation';
import { pushErrorMessage } from './promptMessage';
import colorProperties from './colorProperties';

const QUOTES_REG = /[\\'|\\"]/g;
const VAR_REGEX = /^var\(\-\-(.*)\)$/g;

export default {
  sanitizeSelector(selector, transformDescendantCombinator = false, position = { start: { line: 0, column: 0 } }, log = false) {
    // tag selector suffix @
    if (/^[a-zA-Z]/.test(selector)) {
      selector = `@${ selector}`;
    }
    // filter multiple extend selectors
    if (log && !transformDescendantCombinator && !/^[.|@|#][a-zA-Z0-9_:\-]+$/.test(selector)) {
      const message = `line: ${position.start.line}, column: ${position.start.column} - "${selector}" is not a valid selector (e.g. ".abc、.abcBcd、.abc_bcd")`;
      console.error(chalk.red.bold(message));
      pushErrorMessage(message);
      return null;
    }

    return selector.replace(/\s/gi, '_').replace(/[\.]/g, '');
  },

  convertProp(prop) {
    let result = camelCase(prop);

    // -webkit/-uc/-o to Webkit/Uc/O
    if (/^\-\w/.test(prop)) {
      result = result.replace(/^(\w)/, ($1) => {
        return $1.substring(0, 1).toUpperCase();
      });
    }

    return result;
  },

  convertValue(property, value) {
    let result = value;

    if (typeof value === 'string' && value.search(VAR_REGEX) > -1) {
      // var(--test-var)
      result = value;
      return result;
    }

    if (!Number.isNaN(Number(result))) {
      result = Number(result);
    }

    if (colorProperties[property]) {
      result = normalizeColor(value);
    }

    return result;
  },

  convertCSSVariableValue(value) {
    return value.replace(/\-\-/, '').replace(/\-(\w)/g, (all, letter) => {
      return letter.toUpperCase();
    });
  },

  convert(rule, query = {}) {
    const style = {};
    const { log, theme } = query as any;

    if (rule.tagName === 'text') {
      return;
    }

    rule.declarations.forEach((declaration) => {
      if (declaration.type !== 'declaration') {
        return;
      }
      declaration.value = declaration.value.replace(QUOTES_REG, '');
      const camelCaseProperty = this.convertProp(declaration.property);
      const value = this.convertValue(camelCaseProperty, declaration.value);
      style[camelCaseProperty] = value;

      if (typeof value === 'string' && value.search(VAR_REGEX) > -1 && theme) {
        // var(--test-var)
        Object.assign(style, {
          [camelCaseProperty]: this.convertCSSVariableValue(value),
        });
      } else {
        Validation.validate(camelCaseProperty, declaration.property, declaration.value, rule.selectors.join(', '), declaration.position, log);
        if (particular[camelCaseProperty]) {
          const particularResult = particular[camelCaseProperty](value);
          if (particularResult.isDeleted) {
            style[camelCaseProperty] = null;
            delete style[camelCaseProperty];
            delete particularResult.isDeleted;
          }
          Object.assign(style, particularResult);
        }
      }
    });

    return style;
  },
};
