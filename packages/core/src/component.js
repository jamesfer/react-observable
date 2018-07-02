import { isFunction } from 'lodash'
import { Component } from './component-class'

/**
 * Creates a component from an observable.
 * @param {function} functionComponent
 * @returns {function}
 */
export function component (functionComponent) {
  return class extends Component {
    constructor (props) {
      super(props)

      this.component = null
    }

    render$ (...args) {
      if (this.component === null) {
        // Run the outer function component
        this.component = functionComponent(this.props, {
          untilUnmount: this.untilUnmount,
          ...this.hooks
        })
      }

      if (isFunction(this.component)) {
        return this.component(...args)
      }

      return this.component
    }
  }
}
