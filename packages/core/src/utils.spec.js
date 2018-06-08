import { Observable, of, Subject } from 'rxjs'
import { toArray } from 'rxjs/operators'
/* eslint-env jest */
import { castObservable, mergeObservableArray } from './utils'
import { Watcher } from './watcher'

describe('castObservable', () => {
  it('should return the value as an observable', done => {
    const value = { a: 'true' }
    const value$ = castObservable(value)
    expect(value$).toBeInstanceOf(Observable)
    value$.subscribe({
      next: (emitted) => expect(emitted).toBe(value),
      fail: () => expect.fail(),
      complete: done
    })
  })

  it('should not change an observable value', () => {
    const value$ = of({ a: 'true' })
    expect(castObservable(value$)).toBe(value$)
  })
})

describe('mergeObservableArray', () => {
  it('should return the same array if none of the values are observable', () => {
    const numbers = [1, 2, 3]
    expect(mergeObservableArray(numbers)).toEqual(numbers)
  })

  it('should return an observable that emits all values in the array', done => {
    const numbers = [1, 2, 3]
    const number$ = new Subject()
    const merged$ = mergeObservableArray([ number$, 20, 30 ])

    merged$.pipe(toArray())
      .subscribe(values => {
        expect(values).toEqual(numbers.map(number => [number, 20, 30]))
        done()
      })

    numbers.forEach(number => number$.next(number))
    number$.complete()
  })

  it('should return an observable that completes when all given observables complete', () => {
    const obsA$ = new Subject()
    const obsB$ = new Subject()
    const makeArray = (a, b) => [a, 1, 2, b]
    const merged$ = mergeObservableArray(makeArray(obsA$, obsB$))
    const watcher = new Watcher(merged$)

    obsA$.next('a')
    obsB$.next('b')
    expect(watcher.value).toEqual(makeArray('a', 'b'))
    expect(watcher.count).toBe(1)

    obsA$.complete()
    expect(watcher.value).toEqual(makeArray('a', 'b'))
    expect(watcher.count).toBe(1)
    expect(watcher.completed).toBe(false)

    obsB$.complete()
    expect(watcher.value).toEqual(makeArray('a', 'b'))
    expect(watcher.count).toBe(1)
    expect(watcher.completed).toBe(true)
  })

  it('should search for observables in nested arrays', () => {
    const obsA$ = new Subject()
    const obsB$ = new Subject()
    const makeArray = (a, b) => [1, 2, [3, 4, a], [[b]]]
    const merged$ = mergeObservableArray(makeArray(obsA$, obsB$))
    const watcher = new Watcher(merged$)

    obsA$.next('7')
    obsB$.next({ a: 1 })
    expect(watcher.value).toEqual(makeArray('7', { a: 1 }))
    expect(watcher.count).toBe(1)

    obsB$.next({ a: 2 })
    expect(watcher.value).toEqual(makeArray('7', { a: 2 }))
    expect(watcher.count).toBe(2)

    obsA$.next('8')
    expect(watcher.value).toEqual(makeArray('8', { a: 2 }))
    expect(watcher.count).toBe(3)
  })
})
