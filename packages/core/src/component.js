import { ObservableReactComponent } from './observable-react-component'

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
