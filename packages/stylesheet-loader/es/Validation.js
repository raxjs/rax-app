'use strict';

import BoxModelPropTypes from './BoxModelPropTypes';
import FlexboxPropTypes from './FlexboxPropTypes';
import TextStylePropTypes from './TextStylePropTypes';
import ColorPropTypes from './ColorPropTypes';
import CSSTransitionPropTypes from './CSSTransitionPropTypes';
import { pushWarnMessage } from './promptMessage';
import particular from './particular';
import chalk from 'chalk';

var Validation =
/*#__PURE__*/
function () {
  function Validation() {}

  Validation.validate = function validate(camelCaseProperty, prop, value, selectors, position, log) {
    if (selectors === void 0) {
      selectors = '';
    }

    if (position === void 0) {
      position = {};
    }

    if (!log) return {};

    if (allStylePropTypes[camelCaseProperty]) {
      var error = allStylePropTypes[camelCaseProperty](value, prop, selectors);

      if (error) {
        var message = "line: " + position.start.line + ", column: " + position.start.column + " - " + error.message;
        console.warn(chalk.yellow.bold(message));
        pushWarnMessage(message);
      }

      return error;
    } else {
      if (!particular[camelCaseProperty]) {
        var _message = "line: " + position.start.line + ", column: " + position.start.column + " - \"" + prop + ": " + value + "\" is not valid in \"" + selectors + "\" selector";

        console.warn(chalk.yellow.bold(_message));
        pushWarnMessage(_message);
      }
    }
  };

  Validation.addValidStylePropTypes = function addValidStylePropTypes(stylePropTypes) {
    for (var prop in stylePropTypes) {
      allStylePropTypes[prop] = stylePropTypes[prop];
    }
  };

  return Validation;
}();

var allStylePropTypes = {};
Validation.addValidStylePropTypes(BoxModelPropTypes);
Validation.addValidStylePropTypes(FlexboxPropTypes);
Validation.addValidStylePropTypes(TextStylePropTypes);
Validation.addValidStylePropTypes(ColorPropTypes);
Validation.addValidStylePropTypes(CSSTransitionPropTypes);
export default Validation;