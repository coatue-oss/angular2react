import { element as $, ICompileService, mock, module } from 'angular'
import 'angular-mocks'
import * as React from 'react'
import { renderIntoDocument } from 'react-addons-test-utils'
import { findDOMNode, render, unmountComponentAtNode } from 'react-dom'
import { angular2react } from './'

// Angular component

class FooController {
  bazMoo1Boo: (value: number) => any
  foo: string
  fooBar: number
  _fooBar: number
  constructor(private fooService: FooService) {
    this.fooService.add42(3) // prevent "unused" error
  }
  onClick() {
    if (this.bazMoo1Boo) {
      this.bazMoo1Boo(this.fooBar)
    }
  }
  $onDestroy() {}
}

const FooBarBaz = {
  bindings: {
    bazMoo1Boo: '<',
    foo: '<',
    fooBar: '<'
  },
  controller: FooController,
  template: `
    <span>{{ $ctrl.foo }}</span>
    <span>{{ $ctrl.fooBar*12 }}</span>
    <span>{{ $ctrl.fooService.add42($ctrl.fooBar) }}</span>
    <div ng-click="$ctrl.onClick()">Click Me</div>
    <ng-transclude></ng-transclude>
  `,
  transclude: true
}

class FooService {
  add42(n: number) { return n + 42 }
}

module('test', [])
  .component('fooBarBaz', FooBarBaz)
  .service('fooService', FooService)

let $compile: any
beforeEach(() => {
  mock.module('test')
  mock.inject(function(_$compile_: ICompileService) {
    $compile = _$compile_
  })
})

it('should give a react component', () => {
  const Foo2 = compile($compile)
  const foo2 = new Foo2
  expect(foo2 instanceof React.Component).toBe(true)
})

it('should render', () => {
  const Foo2 = compile($compile)
  const foo2 = renderIntoDocument(<Foo2 foo='hello' fooBar={42} />) as any
  const element = $(findDOMNode(foo2))
  expect(element.find('span').eq(0).text()).toBe('hello')
  expect(element.find('span').eq(1).text()).toBe('504')
})

it('should update', () => {
  const Foo2 = compile($compile)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42} />, element)
  expect($(element).find('span').eq(1).text()).toBe('504')
  render(<Foo2 foo='hello' fooBar={43} />, element)
  expect($(element).find('span').eq(1).text()).toBe('516')
  unmountComponentAtNode(element)
})

it('should destroy', () => {
  const Foo2 = compile($compile)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42} />, element)
  spyOn(FooController.prototype, '$onDestroy')
  unmountComponentAtNode(element)
  expect(FooController.prototype.$onDestroy).toHaveBeenCalled()
})

it('should take callbacks', () => {
  const Foo2 = compile($compile)
  const cb = jasmine.createSpy('bazMoo1Boo')
  const foo2 = renderIntoDocument(<Foo2 foo='hello' fooBar={42} bazMoo1Boo={cb} />) as any
  const element = $(findDOMNode(foo2))
  element.find('div').triggerHandler('click')
  expect(cb).toHaveBeenCalledWith(42)
})

it('should work with dependency injected code', () => {
  const Foo2 = compile($compile)
  const foo2 = renderIntoDocument(<Foo2 foo='hello' fooBar={42} />) as any
  const element = $(findDOMNode(foo2))
  expect(element.find('span').eq(2).text()).toBe('84')
})

// TODO: support children
it('should not support children', () => {
  const Foo2 = compile($compile)
  const foo2 = renderIntoDocument(
    <Foo2 foo='hello' fooBar={42}>
      <span>Child</span>
    </Foo2>
  ) as any
  const element = $(findDOMNode(foo2))
  expect(element.find('ng-transclude').html()).toBe('')
})

function compile($compile: ICompileService) {
  interface Props {
    bazMoo1Boo?(value: number): any
    foo: string
    fooBar: number
  }

  return angular2react<Props>('fooBarBaz', FooBarBaz, $compile)
}
