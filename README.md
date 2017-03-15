<img alt="Angular to React: The easiest way to embed Angular components in a React app" src="https://raw.githubusercontent.com/coatue/angular2react/master/logo.png" width="400px" />

# angular2react [![Build Status](https://img.shields.io/circleci/project/coatue/angular2react.svg?branch=master&style=flat-square)](https://circleci.com/gh/coatue/angular2react) [![NPM](https://img.shields.io/npm/v/angular2react.svg?style=flat-square)](https://www.npmjs.com/package/angular2react) [![Apache2](https://img.shields.io/npm/l/angular2react.svg?style=flat-square)](https://opensource.org/licenses/Apache2)

> One line of code to turn any Angular 1 Component into a React Component

## Installation

```sh
npm install angular2react --save
```

## Usage

### 1. Save a reference to the `$compile` service

```js
let $compile
angular
  .module('myModule')
  .run(['$compile', function(_$compile) { $compile = _$compile }])
```

### 2. Create an Angular component

```js
const MyComponent = {
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

### 3. Expose it to Angular

```js
angular
  .module('myModule', [])
  .component('myComponent', MyComponent)
```

### 4. Convert it to a React Component

```js
import { angular2react } from 'angular2react'

const MyComponent = angular2react('myComponent', MyComponent, $compile)
```

### 5. Use it in your React code

```js
<MyComponent fooBar={3} baz='baz' />
```

## Why step 2?

We need a reference to the `$compile` service used to compile the Angular component you're exposing, so that we can manually compile the component.

If you use [ngimport](https://github.com/bcherny/ngimport), you can skip step 1, and step 4 becomes:

```js
import { angular2react } from 'angular2react'
import { $compile } from 'ngimport'

const MyComponent = angular2react('myComponent', MyComponent, $compile)
```

## Caveats

- Only one way bindings (`<`) are supported, because this is the only type of binding that React supports
- Be sure to bootstrap your Angular app before rendering its React counterpart

## Tests

```sh
npm test
```

## License

Apache2
