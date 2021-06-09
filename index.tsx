import * as angular from 'angular'
import kebabCase = require('lodash.kebabcase')
import * as React from 'react'
import { $injector as defaultInjector } from 'ngimport'

interface Scope<Props> extends angular.IScope {
  props: Props
}

interface State<Props> {
  didInitialCompile: boolean
  scope?: Scope<Props>
}

/**
 * Wraps an Angular component in React. Returns a new React component.
 *
 * Usage:
 *
 *   ```ts
 *   const Bar = { bindings: {...}, template: '...', ... }
 *
 *   angular
 *     .module('foo', [])
 *     .component('bar', Bar)
 *
 *   type Props = {
 *     onChange(value: number): void
 *   }
 *
 *   const Bar = angular2react<Props>('bar', Bar, $compile)
 *
 *   <Bar onChange={...} />
 *   ```
 */
export function angular2react<Props extends object>(
  componentName: string,
  component: angular.IComponentOptions,
  $injector = defaultInjector
): React.ComponentClass<Props> {

  return class Component extends React.Component<Props, State<Props>> {

    state: State<Props> = {
      didInitialCompile: false,
      scope: Object.assign(this.getInjector().get('$rootScope').$new(true), { props: writable(this.props) }),
    }

    getInjector() {
      return $injector || angular.element(document.querySelectorAll('[ng-app]')[0]).injector();
    }

    componentWillUnmount() {
      if (!this.state.scope) {
        return
      }
      this.state.scope.$destroy()
    }

    shouldComponentUpdate(): boolean {
      return false
    }

    // called only once to set up DOM, after componentWillMount
    render() {
      const bindings: { [key: string]: string } = {}
      if (component.bindings) {
        for (const binding in component.bindings) {
          if (component.bindings[binding].includes('@')) {
            // @ts-ignore
            bindings[kebabCase(binding)] = this.props[binding];
          } else {
            bindings[kebabCase(binding)] = `props.${binding}`;
          }
        }
      }
      return React.createElement(kebabCase(componentName),
        { ...bindings, ref: this.compile.bind(this) }
      )
    }

    // makes angular aware of changed props
    // if we're not inside a digest cycle, kicks off a digest cycle before setting.
    static getDerivedStateFromProps(props: Props, state: State<Props>) {
      if (!state.scope) {
        return null
      }
      state.scope.props = writable(props)
      Component.digest(state.scope)

      return {...state};
    }

    private compile(element: HTMLElement) {
      if (this.state.didInitialCompile || !this.state.scope) {
        return
      }

      const $injector = this.getInjector();
      $injector.get('$compile')(element)(this.state.scope)
      Component.digest(this.state.scope)
      this.setState({ didInitialCompile: true })
    }

    static digest(scope: Scope<Props>) {
      if (!scope) {
        return
      }
      try {scope.$digest() } catch (e) { }
    }

  }
}

/**
 * Angular may try to bind back a value via 2-way binding, but React marks all
 * properties on `props` as non-configurable and non-writable.
 *
 * If we use a `Proxy` to intercept writes to these non-writable properties,
 * we run into an issue where the proxy throws when trying to write anyway,
 * even if we `return false`.
 *
 * Instead, we use the below ad-hoc proxy to catch writes to non-writable
 * properties in `object`, and log a helpful warning when it happens.
 */
function writable<T extends object>(object: T): T {
  const _object = {} as T
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      Object.defineProperty(_object, key, {
        get() { return object[key] },
        set(value: any) {
          let d = Object.getOwnPropertyDescriptor(object, key)
          if (d && d.writable) {
            return object[key] = value
          } else {
            console.warn(`Tried to write to non-writable property "${key}" of`, object, `. Consider using a callback instead of 2-way binding.`)
          }
        }
      })
    }
  }
  return _object
}
