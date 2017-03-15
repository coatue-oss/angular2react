import { element as $, IComponentOptions, IScope } from 'angular'
import kebabCase = require('lodash.kebabcase')
import { $compile as defaultCompile, $log, $rootScope } from 'ngimport'
import * as React from 'react'

interface Scope<Props> extends IScope {
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
  component: IComponentOptions,
  $compile = defaultCompile
): React.ComponentClass<Props> {

  return class extends React.Component<Props, State<Props>> {

    state: State<Props> = {
      didInitialCompile: false
    }

    componentWillMount() {
      this.setState({
        scope: Object.assign($rootScope.$new(true), { props: writable(this.props) })
      })
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
      return <div ref={this.compile.bind(this)} />
    }

    // makes angular aware of changed props
    // if we're not inside a digest cycle, kicks off a digest cycle before setting.
    componentWillReceiveProps(props: Props) {
      if (!this.state.scope) {
        return
      }
      this.state.scope.props = writable(props)
      this.digest()
    }

    private compile(div: HTMLDivElement) {
      if (this.state.didInitialCompile || !this.state.scope) {
        return
      }

      const bindings = bindingsToAttrs(component.bindings)
      const element = $(`<${kebabCase(componentName)} ${bindings}></${componentName}>`)
      $compile(element)(this.state.scope)
      $(div).empty().append(element)
      this.digest()

      this.setState({ didInitialCompile: true })
    }

    private digest() {
      if (!this.state.scope) {
        return
      }
      try { this.state.scope.$digest() } catch (e) { }
    }

  }
}

/**
 * Convert an Angular `bindings` object to a partial HTML string
 */
function bindingsToAttrs<T extends object>(bindings?: T): string {
  if (!bindings) {
    return ''
  }
  let _bindings = []
  for (const binding in bindings) {
    _bindings.push(`${kebabCase(binding)}="props.${binding}"`)
  }
  return _bindings.join(' ')
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
          if (Object.getOwnPropertyDescriptor(object, key).writable) {
            return object[key] = value
          } else {
            $log.warn(`Tried to write to non-writable property "${key}" of`, object, `. Consider using a callback instead of 2-way binding.`)
          }
        }
      })
    }
  }
  return _object
}
