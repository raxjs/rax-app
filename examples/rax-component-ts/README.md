## rax-component

## Install

```
$ npm install rax-component --save
```

## Usage

```
import MyComponent from 'rax-component';
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
import MyComponent from 'rax-component';

render(<MyComponent />, document.body, { driver: DriverUniversal });
```
