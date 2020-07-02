## rax-component-js

## Install

```
$ npm install rax-component-js --save
```

## Usage

```
import MyComponent from 'rax-component-js';
```

## API

### Props

|name|type|default|describe|
|:---------------|:--------|:----|:----------|
|name|String|''|describe|

### Function

|name|param|return|describe|
|:---------------|:--------|:----|:----------|
|name|Object|/|describe|

## Example

```
import { createElement, render } from 'rax';
import DriverUniversal from 'driver-universal';
import MyComponent from 'rax-component-js';

render(<MyComponent />, document.body, { driver: DriverUniversal });
```
