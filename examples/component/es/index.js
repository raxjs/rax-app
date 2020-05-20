import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';

var MyComponent = function () {
  return createElement(View, null, createElement(Text, null, "Hello World!"));
};

export default MyComponent;