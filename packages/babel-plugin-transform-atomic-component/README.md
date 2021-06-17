# babel-plugin-transform-atomic-component
> Transform rax atomic component to native html elements for better ssr performance.

## Installation

```sh
npm install --save-dev babel-plugin-transform-atomic-component
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [
    "babel-plugin-transform-atomic-component",
    "babel-plugin-transform-jsx-to-html",
    "babel/plugin-transform-react-jsx"
  ]
}
```

Note: place this babel plugin before `babel-plugin-transform-jsx-to-html`

## Example

### basic example

Your `component.jsx` that contains this code:

```js
import { createElement, Component } from 'rax';
import View from 'rax-view'

class App extends Component {
  render() {
    return <View className="header">
      Hello world
    </View>
  }
}
```

Will be transpiled into this:

```js
import { createElement, Component } from 'rax';
import View from 'rax-view'

class App extends Component {
  render() {
    return <div className="rax-view-v2 header">
      Hello world
    </div>
  }
}
```
