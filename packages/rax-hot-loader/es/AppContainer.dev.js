'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import { Component, createElement } from 'rax';
import deepForceUpdate from 'react-deep-force-update';
import Children from 'react-children';

var AppContainer =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(AppContainer, _Component);

  function AppContainer(props) {
    var _this;

    _this = _Component.call(this, props) || this;
    _this.state = {
      error: null
    };
    return _this;
  }

  var _proto = AppContainer.prototype;

  _proto.componentDidMount = function componentDidMount() {
    if (typeof __RAX_HOT_LOADER__ === 'undefined') {
      console.error('Rax Hot Loader: It appears that "rax-hot-loader/patch" ' + 'did not run immediately before the app started. Make sure that it ' + 'runs before any other code. For example, if you use Webpack, ' + 'you can add "rax-hot-loader/patch" as the very first item to the ' + '"entry" array in its config. Alternatively, you can add ' + 'require("rax-hot-loader/patch") as the very first line ' + 'in the application code, before any other imports.');
    }
  };

  _proto.componentWillReceiveProps = function componentWillReceiveProps() {
    // Hot reload is happening.
    // Retry rendering!
    this.setState({
      error: null
    }); // Force-update the whole tree, including
    // components that refuse to update.

    deepForceUpdate(this);
  } // This hook is going to become official in React 15.x.
  // In 15.0, it only catches errors on initial mount.
  // Later it will work for updates as well:
  // https://github.com/facebook/react/pull/6020
  ;

  _proto.unstable_handleError = function unstable_handleError(error) {
    // eslint-disable-line camelcase
    this.setState({
      error: error
    });
  };

  _proto.render = function render() {
    var error = this.state.error;

    if (error) {
      console.log(error);
      return false;
    }

    return Children.only(this.props.children);
  };

  return AppContainer;
}(Component);

AppContainer.propTypes = {
  children: function children(props) {
    if (Children.count(props.children) !== 1) {
      return new Error('Invalid prop "children" supplied to AppContainer. ' + 'Expected a single React element with your app’s root component, e.g. <App />.');
    }

    return undefined;
  }
};
module.exports = AppContainer;