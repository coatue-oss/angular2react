<img alt="Angular to React: The easiest way to embed Angular components in a React app" src="https://raw.githubusercontent.com/coatue/angular2react/master/logo.png" width="400px" />

# angular2react [![Build Status](https://img.shields.io/circleci/project/coatue/angular2react.svg?branch=master&style=flat-square)](https://circleci.com/gh/coatue/angular2react) [![NPM](https://img.shields.io/npm/v/angular2react.svg?style=flat-square)](https://www.npmjs.com/package/angular2react) [![Apache2](https://img.shields.io/npm/l/angular2react.svg?style=flat-square)](https://opensource.org/licenses/Apache2)

> One line of code to turn any Angular 1 Component into a React Component

## Installation

```sh
npm install angular2react --save
```

## Usage

### 1. Create a React component

```jsx
import { Component } from 'react'

class MyComponent extends Component {
  render() {
    return <div>
      <p>FooBar: {this.props.fooBar}</p>
      <p>Baz: {this.props.baz}</p>
    </div>
  }
}
```

### 2. Expose it to Angular

```js
import { angular2react } from 'angular2react'

angular
  .module('myModule', [])
  .component('myComponent', angular2react(MyComponent, ['fooBar', 'baz']))
```

### 3. Use it in your Angular 1 code

```html
<my-component
  foo-bar="3"
  baz="'baz'"
></my-component>
```

## Tests

```sh
npm test
```

## License

Apache2
