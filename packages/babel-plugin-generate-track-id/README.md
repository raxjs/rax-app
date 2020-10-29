# babel-plugin-generate-track-id

> Generate track id for auto tracker.

## Installation

```sh
npm install --save-dev babel-plugin-generate-track-id
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [
    "babel-plugin-generate-track-id"
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
