---
order: 1
---

# Basic

basic usage

```jsx
import { createElement, render } from 'rax';
import DriverUniversal from 'driver-universal';
import MyComponent from 'rax-component-js';

render(<MyComponent />, document.body, { driver: DriverUniversal });
```
