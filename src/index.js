import React from 'react'
import { Observable, Subject } from 'rxjs'
import { mergeObservableArray, mergeObservableObject, castObservable } from './utils'

/**
 * Substitute jsx renderer.
 * @param {string|function} type
 * @param {object} props
 * @param {string|Observable} children
 */
export function createElement (type, props, ...children) {
  // Create an observable from props
  const propsObservable$ = mergeObservableObject(props)

  // Create an observable for the whole element
  const elementObservable$ = mergeObservableArray([
    type,
    propsObservable$,
    ...children
  ])

  if (elementObservable$ instanceof Observable) {
    return elementObservable$
      .map(([ type, props, ...children ]) => {
        return React.createElement(type, props, ...children)
      })
  }
  return React.createElement(type, props, ...children)
}

class ObservableReactComponent extends React.Component {
  constructor (props, functionComponent) {
    super(props)
    this.state = {
      element: null
    }
    this.hooks = {
      mounted$: new Subject().startWith(false),
      componentDidMount$: new Subject(),
      componentWillUnmount$: new Subject(),
      componentDidUpdate$: new Subject()
    }

    this.component$ = castObservable(functionComponent(props, this.hooks))

    // Subscription is automatically cleaned up when the component is
    // destroyed
    this.component$.takeUntil(this.hooks.componentWillUnmount$)
      .withLatestFrom(this.hooks.mounted$)
      .subscribe(([element, mounted]) => {
        if (mounted) {
          this.setState({ element })
        } else {
          this.state = { element }
        }
      })
  }

  componentDidMount () {
    this.hooks.mounted$.next(true)
    this.hooks.componentDidMount$.next()
  }

  componentWillUnmount () {
    this.hooks.mounted$.next(false)
    this.hooks.componentWillUnmount$.next()
  }

  render () {
    return this.state.element
  }
}

/**
 * Creates a component from an observable.
 * @param {function} functionComponent
 * @returns {function}
 */
export function component (functionComponent) {
  return class extends ObservableReactComponent {
    constructor (props) {
      super(props, functionComponent)
    }
  }
}

export default {
  ...React,
  createElement,
  createReactElement: React.createElement
}
