import React from 'react'
import { Observable, Subject } from 'rxjs'
import { component, createElement } from './observable-react'

describe('createElement', () => {
  it('should return a plain element when no inputs are observable', () => {
    let props = { id: 'title' }
    let child = 'Hello world'
    const element = createElement('div', props, child)
    const reactElement = React.createElement('div', props, child)

    expect(element).toEqual(reactElement)
  })

  it('should return an observable that emits when an attribute does', done => {
    const ids = [ 1, 2, 3 ]
    const id$ = Observable.from(ids)
    const expectedElements = ids.map(id => React.createElement('div', { id }))

    const element$ = createElement('div', { id: id$ })

    expect(element$).toBeInstanceOf(Observable)
    element$.toArray()
      .subscribe(elements => {
        expect(elements).toEqual(expectedElements)
        done()
      })
  })

  it('should return an observable that emits any of its attributes do', done => {
    const id$ = new Subject()
    const className$ = new Subject()
    const expectedElements = [
      React.createElement('div', { id: 1, className: 'first' }),
      React.createElement('div', { id: 2, className: 'first' }),
      React.createElement('div', { id: 2, className: 'second' }),
      React.createElement('div', { id: 3, className: 'second' })
    ]

    const element$ = createElement('div', {
      id: id$.startWith(1),
      className: className$.startWith('first')
    })

    expect(element$).toBeInstanceOf(Observable)
    element$.toArray()
      .subscribe(elements => {
        expect(elements).toEqual(expectedElements)
        done()
      })

    id$.next(2)
    className$.next('second')
    id$.next(3)

    id$.complete()
    className$.complete()
  })

  it('should return an observable that emits when a child does', done => {
    const childText = [ '1', '2', '3' ]
    const childText$ = Observable.from(childText)
    const expectedElements = childText.map(text => {
      return React.createElement('div', null, text)
    })

    const element$ = createElement('div', null, childText$)

    expect(element$).toBeInstanceOf(Observable)
    element$.toArray()
      .subscribe(elements => {
        expect(elements).toEqual(expectedElements)
        done()
      })
  })
})


describe('component', () => {
  it('should return a new class that extends React.Component', () => {
    const componentClass = component(() => createElement('div', null))
    expect(componentClass.prototype).toBeInstanceOf(React.Component)
  })

  it('should render the component', () => {
    const componentClass = component(() => createElement('div', null))
    const instance = new componentClass({})

    expect(instance.render()).toEqual(React.createElement('div', null))
  })

  it('should render updated component if it changes before it was mounted', () => {
    const id$ = new Subject()
    const componentClass = component(() => createElement('div', {
      id: id$.startWith('1')
    }))
    const instance = new componentClass({})

    id$.next('2')
    expect(instance.render()).toEqual(React.createElement('div', { id: '2' }))
  })

  it('should call setState when it changes after it was mounted', () => {
    const id$ = new Subject()
    const componentClass = component(() => createElement('div', {
      id: id$.startWith('1')
    }))
    const instance = new componentClass({})
    instance.setState = jest.fn()

    instance.componentDidMount()

    id$.next('2')
    expect(instance.setState).toBeCalledWith({
      element: React.createElement('div', { id: '2' })
    })
  })

  it('should unsubscribe from updates when it is unmounted', () => {
    const id$ = new Subject()
    const componentClass = component(() => createElement('div', {
      id: id$.startWith('1')
    }))
    const instance = new componentClass({})

    id$.next('2')
    instance.componentWillUnmount()
    id$.next('3')
    expect(instance.render()).toEqual(React.createElement('div', { id: '2' }))
  })
})
