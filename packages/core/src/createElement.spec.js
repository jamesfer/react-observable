/* eslint-env jest */
import React from 'react'
import { from, Observable, Subject } from 'rxjs'
import { startWith, toArray } from 'rxjs/operators'
import { createElement } from './createElement'

describe('createElement', () => {
  it('should create a element with null props', () => {
    const element = createElement('div', null)
    const reactElement = React.createElement('div', null)
    expect(element).toEqual(reactElement)
  })

  it('should create a element with no children', () => {
    const props = { a: 1 }
    const element = createElement('div', props)
    const reactElement = React.createElement('div', props)
    expect(element).toEqual(reactElement)
  })

  it('should return a plain element when no inputs are observable', () => {
    let props = { id: 'title' }
    let child = 'Hello world'
    const element = createElement('div', props, child)
    const reactElement = React.createElement('div', props, child)

    expect(element).toEqual(reactElement)
  })

  it('should return an observable that emits when an attribute does', done => {
    const ids = [ 1, 2, 3 ]
    const id$ = from(ids)
    const expectedElements = ids.map(id => React.createElement('div', { id }))

    const element$ = createElement('div', { id: id$ })

    expect(element$).toBeInstanceOf(Observable)
    element$.pipe(toArray())
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
      id: id$.pipe(startWith(1)),
      className: className$.pipe(startWith('first'))
    })

    expect(element$).toBeInstanceOf(Observable)
    element$.pipe(toArray())
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
    const childText$ = from(childText)
    const expectedElements = childText.map(text => {
      return React.createElement('div', null, text)
    })

    const element$ = createElement('div', null, childText$)

    expect(element$).toBeInstanceOf(Observable)
    element$.pipe(toArray())
      .subscribe(elements => {
        expect(elements).toEqual(expectedElements)
        done()
      })
  })
})
