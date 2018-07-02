/* eslint-env jest */
import { component } from './component'
import { Component } from './component-class'
import { createElement } from './index'

describe('component', () => {
  it('should return a new Component class', () => {
    const componentClass = component(() => createElement('div', null))
    expect(componentClass.prototype).toBeInstanceOf(Component)
  })

  it('should only call the outer component function on first render', () => {
    const componentFn = jest.fn(() => createElement('div', null))
    const componentInstance = new (component(componentFn))()
    expect(componentFn).not.toHaveBeenCalled()
    componentInstance.render$()
    expect(componentFn).toHaveBeenCalledTimes(1)
    componentInstance.render$()
    expect(componentFn).toHaveBeenCalledTimes(1)
  })

  it('should call the inner component function on every render', () => {
    const componentFn = jest.fn(() => createElement('div', null))
    const componentInstance = new (component(() => componentFn))()
    expect(componentFn).not.toHaveBeenCalled()
    componentInstance.render$()
    expect(componentFn).toHaveBeenCalledTimes(1)
    componentInstance.render$()
    expect(componentFn).toHaveBeenCalledTimes(2)
  })
})
