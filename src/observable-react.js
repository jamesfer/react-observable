import React from 'react'
import { Observable } from 'rxjs'
import {
  baseValueOf, mergeObservableArray, mergeObservableObject,
  recursiveMergeObservableArray,
} from './utils'


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
    // .startWith(baseValueOf([ type, props, ...children ]))
      .map(([ type, props, ...children ]) => {
        return React.createElement(type, props, ...children)
      })
  }
  return React.createElement(type, props, ...children)
}


class ObservableReactComponent extends React.Component {
  constructor (props, functionComponent) {
    super(props)
    this.mounted = false
    this.state = {
      element: null
    }

    const component = functionComponent(props)
    const component$ = component instanceof Observable ? component
      : Observable.of(component)

    this.componentSubscription = component$.subscribe(element => {
      if (this.mounted) {
        this.setState({ element })
      } else {
        this.state = { element }
      }
    })
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillUnmount () {
    this.componentSubscription.unsubscribe()
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
    constructor(props) {
      super(props, functionComponent)
    }
  }
}


export default {
  createElement,
  component
}
