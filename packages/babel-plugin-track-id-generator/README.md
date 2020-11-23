# babel-plugin-track-id-generator

> Generate track id for auto tracker.

## Installation

```sh
npm install --save-dev babel-plugin-track-id-generator
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [
    "babel-plugin-track-id-generator"
  ]
}
```

## Example

Component has `onClick` or `href` prop:

```js
import { createElement, Component } from 'rax';

class App extends Component {
  render() {
    return <div className="header" onClick={onClick} />
  }
}
```

Will be transpiled like this:

```js
import { createElement, Component } from 'rax';

class App extends Component {
  render() {
    return <div className="header" onClick={onClick} track-id="23i830i" />
  }
}
```

`track-id` is generated based on the file path.
