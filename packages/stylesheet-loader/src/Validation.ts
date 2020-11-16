

import chalk from 'chalk';
import BoxModelPropTypes from './BoxModelPropTypes';
import FlexboxPropTypes from './FlexboxPropTypes';
import TextStylePropTypes from './TextStylePropTypes';
import ColorPropTypes from './ColorPropTypes';
import CSSTransitionPropTypes from './CSSTransitionPropTypes';
import { pushWarnMessage } from './promptMessage';
import particular from './particular';

class Validation {
  static validate(camelCaseProperty, prop, value, selectors = '', position: any = {}, log) {
    if (!log) return {};
    if (allStylePropTypes[camelCaseProperty]) {
      const error = allStylePropTypes[camelCaseProperty](value, prop, selectors);

      if (error) {
        const message = `line: ${position.start.line}, column: ${position.start.column} - ${error.message}`;
        console.warn(chalk.yellow.bold(message));
        pushWarnMessage(message);
      }
      return error;
    } else if (!particular[camelCaseProperty]) {
      const message = `line: ${position.start.line}, column: ${position.start.column} - "${prop}: ${value}" is not valid in "${selectors}" selector`;
      console.warn(chalk.yellow.bold(message));
      pushWarnMessage(message);
    }
  }

  static addValidStylePropTypes(stylePropTypes) {
    // eslint-disable-next-line guard-for-in
    for (const prop in stylePropTypes) {
      allStylePropTypes[prop] = stylePropTypes[prop];
    }
  }
}

let allStylePropTypes = {};

Validation.addValidStylePropTypes(BoxModelPropTypes);
Validation.addValidStylePropTypes(FlexboxPropTypes);
Validation.addValidStylePropTypes(TextStylePropTypes);
Validation.addValidStylePropTypes(ColorPropTypes);
Validation.addValidStylePropTypes(CSSTransitionPropTypes);

export default Validation;
