import { auto, element as $, mock, module } from 'angular'
import 'angular-mocks'
import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
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

let $injector: any
beforeEach(() => {
  mock.module('test')
  mock.inject(function(_$injector_: auto.IInjectorService) {
    $injector = _$injector_
  })
})

it('should give a react component', () => {
  const Foo2 = compile($injector)
  const foo2 = new Foo2
  expect(foo2 instanceof React.Component).toBe(true)
})

it('should render', () => {
  const Foo2 = compile($injector)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42} />, element)
  expect($(element).find('span').eq(0).text()).toBe('hello')
  expect($(element).find('span').eq(1).text()).toBe('504')
  unmountComponentAtNode(element)
})

it('should update', () => {
  const Foo2 = compile($injector)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42} />, element)
  expect($(element).find('span').eq(1).text()).toBe('504')
  unmountComponentAtNode(element)
  render(<Foo2 foo='hello' fooBar={43} />, element)
  expect($(element).find('span').eq(1).text()).toBe('516')
  unmountComponentAtNode(element)
})

it('should destroy', () => {
  const Foo2 = compile($injector)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42} />, element)
  spyOn(FooController.prototype, '$onDestroy')
  const unmounted = unmountComponentAtNode(element)
  expect(unmounted).toBeTruthy()
  expect(FooController.prototype.$onDestroy).toHaveBeenCalled()
  expect(element.childNodes.length).toBe(0)
})

it('should take callbacks', () => {
  const Foo2 = compile($injector)
  const element = document.createElement('div')
  const cb = jasmine.createSpy('bazMoo1Boo')
  render(<Foo2 foo='hello' fooBar={42} bazMoo1Boo={cb} />, element)
  $(element).find('div').triggerHandler('click')
  expect(cb).toHaveBeenCalledWith(42)
  unmountComponentAtNode(element)
})

it('should work with dependency injected code', () => {
  const Foo2 = compile($injector)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42} />, element)
  expect($(element).find('span').eq(2).text()).toBe('84')
  unmountComponentAtNode(element)
})

// TODO: support children
it('should not support children', () => {
  const Foo2 = compile($injector)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42}>
           <span>Child</span>
         </Foo2>, element)
  expect($(element).find('ng-transclude').html()).toBe('')
  unmountComponentAtNode(element)
})

it('should use the angular component as the root component', () => {
  const Foo2 = compile($injector)
  const element = document.createElement('div')
  render(<Foo2 foo='hello' fooBar={42} />, element)
  expect($(element).children('foo-bar-baz-single')[0]).toBeTruthy
  unmountComponentAtNode(element)
})

interface Props {
  bazMoo1Boo?(value: number): any
  foo: string
  fooBar: number
}

function compile($injector: auto.IInjectorService) {
  return angular2react<Props>('fooBarBaz', FooBarBaz, $injector)
}
