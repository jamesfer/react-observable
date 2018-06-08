/* eslint-env jest */
import { each, mapValues } from 'lodash'
import { createElement as createReactElement } from 'react'
import { Subject } from 'rxjs'
import { startWith } from 'rxjs/operators'
import { createElement } from './createElement'
import { ObservableReactComponent } from './observable-react-component'
import { Watcher } from './watcher'

describe('ObservableReactComponent', () => {
  it('should render a component', () => {
    const fnComponent = () => createElement('div', null)
    const classComponent = new ObservableReactComponent({}, fnComponent)
    expect(classComponent.render()).toEqual(createReactElement('div', null))
  })

  it('should update the render when an observable is updated', () => {
    const id$ = new Subject()
    const fnComponent = () => createElement('div', { id: id$.pipe(startWith('a')) })
    const classComponent = new ObservableReactComponent({}, fnComponent)
    expect(classComponent.render())
      .toEqual(createReactElement('div', { id: 'a' }))

    id$.next('b')
    expect(classComponent.render())
      .toEqual(createReactElement('div', { id: 'b' }))
  })

  it('should render null until all observables emit', () => {
    const id$ = new Subject()
    const fnComponent = () => createElement('div', { id: id$ })
    const classComponent = new ObservableReactComponent({}, fnComponent)
    expect(classComponent.render()).toBe(null)

    id$.next('a')
    expect(classComponent.render())
      .toEqual(createReactElement('div', { id: 'a' }))
  })

  it('should render a component that relies on props', () => {
    const props = { id: 1 }
    const fnComponent = () => props => createElement('div', props)
    const classComponent = new ObservableReactComponent(props, fnComponent)
    expect(classComponent.render()).toEqual(createReactElement('div', props))
  })

  it('should update the render when props change', () => {
    const props = { id: 1 }
    const fnComponent = () => props => createElement('div', props)
    const classComponent = new ObservableReactComponent(props, fnComponent)
    expect(classComponent.render()).toEqual(createReactElement('div', props))

    const props2 = { id: 2 }
    classComponent.shouldComponentUpdate(props2, {})
    expect(classComponent.render()).toEqual(createReactElement('div', props2))
  })

  it('should call setState when the component emits after mounting', () => {
    const id$ = new Subject()
    const fnComponent = () => createElement('div', { id: id$.pipe(startWith('a')) })

    const instance = new ObservableReactComponent({}, fnComponent)
    instance.setState = jest.fn()
    instance.componentDidMount()

    id$.next('b')
    expect(instance.setState).toBeCalledWith({
      element: createReactElement('div', { id: 'b' })
    })
  })

  it('should fire untilUnmount correctly', () => {
    const fnComponent = () => createReactElement('div', null)
    const component = new ObservableReactComponent({}, fnComponent)
    const subject = new Subject()
    const watcher = new Watcher(subject.pipe(component.untilUnmount))

    subject.next(1)
    expect(watcher.value).toBe(1)
    expect(watcher.count).toBe(1)

    component.componentWillUnmount()
    subject.next(2)
    expect(watcher.value).toBe(1)
    expect(watcher.count).toBe(1)
  })

  it('should update the mounted$ hook correctly', () => {
    const fnComponent = () => createElement('div', null)
    const classComponent = new ObservableReactComponent({}, fnComponent)
    const watcher = new Watcher(classComponent.hooks.mounted$)

    // Mounted should start as false
    expect(watcher.value).toBe(false)
    expect(watcher.count).toBe(1)

    classComponent.componentDidMount()
    expect(watcher.value).toBe(true)
    expect(watcher.count).toBe(2)

    classComponent.componentWillUnmount()
    expect(watcher.value).toBe(false)
    expect(watcher.count).toBe(3)
  })

  it('should update the componentDidMount$ hook correctly', () => {
    const fnComponent = () => createElement('div', null)
    const classComponent = new ObservableReactComponent({}, fnComponent)
    const watcher = new Watcher(classComponent.hooks.componentDidMount$)

    expect(watcher.count).toBe(0)
    classComponent.componentDidMount()
    expect(watcher.count).toBe(1)
  })

  it('should update the componentWillUnmount$ hook correctly', () => {
    const fnComponent = () => createElement('div', null)
    const classComponent = new ObservableReactComponent({}, fnComponent)
    const watcher = new Watcher(classComponent.hooks.componentWillUnmount$)

    expect(watcher.count).toBe(0)
    classComponent.componentWillUnmount()
    expect(watcher.count).toBe(1)
  })

  it('should update the componentDidUpdate$ hook correctly', () => {
    const fnComponent = () => createElement('div', null)
    const classComponent = new ObservableReactComponent({}, fnComponent)
    const watcher = new Watcher(classComponent.hooks.componentDidUpdate$)

    const prevProps = { name: 'jerome' }
    const prevState = { loaded: false }
    expect(watcher.count).toBe(0)
    classComponent.componentDidUpdate(prevProps, prevState)
    expect(watcher.count).toBe(1)
    expect(watcher.value.prevProps).toBe(prevProps)
    expect(watcher.value.prevState).toBe(prevState)
  })

  it('should automatically unsubscribe all hooks after unmounting', () => {
    const fnComponent = () => createElement('div', null)
    const classComponent = new ObservableReactComponent({}, fnComponent)
    const watchers = mapValues(classComponent.hooks, hook => new Watcher(hook))

    each(watchers, watcher => expect(watcher.completed).toBe(false))
    classComponent.componentWillUnmount()
    each(watchers, watcher => expect(watcher.completed).toBe(true))
  })
})
