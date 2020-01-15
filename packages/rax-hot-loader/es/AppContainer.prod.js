/* eslint-disable react/prop-types */
import { createElement, Component } from 'rax';
import Children from 'react-children';

'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

const AppContainer =
/* #__PURE__ */
function (_Component) {
  _inheritsLoose(AppContainer, _Component);

  function AppContainer() {
    return _Component.apply(this, arguments) || this;
  }

  const _proto = AppContainer.prototype;

  _proto.render = function render() {
    if (this.props.component) {
      return createElement(this.props.component, this.props.props);
    }

    return Children.only(this.props.children);
  };

  return AppContainer;
}(Component);

module.exports = AppContainer;