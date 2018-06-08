/* eslint-env jest */
import { component } from './component'
import { createElement } from './index'
import { ObservableReactComponent } from './observable-react-component'

describe('component', () => {
  it('should return a new ObservableReactComponent class', () => {
    const componentClass = component(() => createElement('div', null))
    expect(componentClass.prototype).toBeInstanceOf(ObservableReactComponent)
  })

  it('should pass props to the component', () => {
    const givenProps = { a: 1 }
    let receivedProps = null
    const componentFn = () => props => {
      receivedProps = props
      createElement('div', null)
    }
    ;(() => new (component(componentFn))(givenProps))()
    expect(receivedProps).toBe(givenProps)
  })
})
