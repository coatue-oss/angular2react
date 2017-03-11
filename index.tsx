import { IScope } from 'angular'
import { $compile, $log, $rootScope } from 'ngimport'
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
 *   angular
 *     .module('foo', [])
 *     .component('bar', {...})
 *
 *   type Props = {
 *     onChange(value: number): void
 *   }
 *
 *   const Bar = angular2react<Props>(
 *    '<bar on-change="props.onChange"></bar>
 *   ')
 *
 *   <Bar onChange={...} />
 *   ```
 */
export function angular2react<Props extends object>(template: string) {
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
      try { this.state.scope.$digest() } catch (e) { }
    }

    private compile(div: HTMLDivElement) {
      if (this.state.didInitialCompile || !this.state.scope) {
        return
      }
      div.innerHTML = template
      $compile(div)(this.state.scope)
      this.setState({ didInitialCompile: true })
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