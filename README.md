<img alt="Angular to React: The easiest way to embed Angular components in a React app" src="https://raw.githubusercontent.com/coatue-oss/angular2react/master/logo.png" width="400px" />

# angular2react [![Build Status](https://img.shields.io/circleci/project/coatue-oss/angular2react.svg?branch=master&style=flat-square)](https://circleci.com/gh/coatue-oss/angular2react) [![NPM](https://img.shields.io/npm/v/angular2react.svg?style=flat-square)](https://www.npmjs.com/package/angular2react) [![Apache2](https://img.shields.io/npm/l/angular2react.svg?style=flat-square)](https://opensource.org/licenses/Apache2)

> One line of code to turn any Angular 1 Component into a React Component (opposite of [react2angular](https://github.com/coatue-oss/react2angular))

## Installation

Requires AngularJS 1.5.0 or later for the `.component()` API and one-way (`<`) bindings. This library wraps AngularJS (Angular 1.x) components, not Angular 2+ components.

```sh
# Using Yarn:
yarn add angular2react angular angular-resource react react-dom @types/angular @types/react @types/react-dom

# Or, using NPM:
npm install angular2react angular angular-resource react react-dom @types/angular @types/react @types/react-dom --save
```

## Usage

### 1. Save a reference to the `$injector`

```js
let $injector
angular
  .module('myModule', [])
  .run(['$injector', function(_$injector) { $injector = _$injector }])
```

This creates the AngularJS module. If your app already defines `myModule`, use `.module('myModule')` instead to retrieve it without replacing its registrations.

### 2. Create an Angular component

```js
const MyAngularComponent = {
  bindings: {
    fooBar: '<',
    baz: '<'
  },
  template: `
    <p>FooBar: {{$ctrl.fooBar}}</p>
    <p>Baz: {{$ctrl.baz}}</p>
  `
}
```

### 3. Expose it to Angular

```js
angular
  .module('myModule')
  .component('myComponent', MyAngularComponent)
```

### 4. Convert it to a React Component

Run this step after your AngularJS app has bootstrapped and the run block in step 1 has assigned `$injector`.

```js
import { angular2react } from 'angular2react'

const MyComponent = angular2react('myComponent', MyAngularComponent, $injector)
```

### 5. Use it in your React code

```js
<MyComponent fooBar={3} baz='baz' />
```

## Why step 1?

We need a reference to the `$injector` created by the Angular module that registered the Angular component you're exposing. That way we can manually compile your component.

If you use [ngimport](https://github.com/bcherny/ngimport), replace step 1 with module creation that includes its AngularJS dependency:

```js
angular.module('myModule', ['bcherny/ngimport'])
```

If your app already defines `myModule`, add `'bcherny/ngimport'` to its existing dependency list instead of creating the module again. Continue with steps 2 and 3. After the app has bootstrapped, omit the last argument in step 4:

```js
import { angular2react } from 'angular2react'

const MyComponent = angular2react('myComponent', MyAngularComponent)
```

## Full Examples

https://github.com/bcherny/angular2react-demos

## Caveats

- Only one way bindings (`<`) are supported, because this is the only type of binding that React supports
- Be sure to bootstrap your Angular app before rendering its React counterpart

## Tests

```sh
npm test
```

## License

Apache-2.0
