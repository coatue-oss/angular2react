<img alt="Angular to React: The easiest way to embed Angular components in a React app" src="https://raw.githubusercontent.com/coatue/angular2react/master/logo.png" width="400px" />

# angular2react [![Build Status](https://img.shields.io/circleci/project/coatue/angular2react.svg?branch=master&style=flat-square)](https://circleci.com/gh/coatue/angular2react) [![NPM](https://img.shields.io/npm/v/angular2react.svg?style=flat-square)](https://www.npmjs.com/package/angular2react) [![Apache2](https://img.shields.io/npm/l/angular2react.svg?style=flat-square)](https://opensource.org/licenses/Apache2)

> One line of code to turn any Angular 1 Component into a React Component

## Installation

```sh
npm install angular2react --save
```

## Usage

### 1. Create an Angular component

```js
const myComponent = {
  bindings: {
    fooBar: '<',
    baz: '<'
  },
  template: `
    <p>FooBar: {this.$ctrl.fooBar}</p>
    <p>Baz: {this.$ctrl.baz}</p>
  `
}
```

### 2. Expose it to Angular

```js
angular
  .module('myModule', [])
  .component('myComponent', MyComponent)
```

### 3. Convert it to a React Component

```js
import { angular2react } from 'angular2react'

const MyComponent = angular2react('myComponent', MyComponent)
```

### 4. Use it in your React code

```jsx
<MyComponent fooBar={3} baz={'baz'} />
```

## Tests

```sh
npm test
```

## License

Apache2
