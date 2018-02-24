import { mergeObservableArray } from './utils'
import { Observable, Subject } from 'rxjs'


describe('mergeObservableArray', () => {
  it('should return the same array if none of the values are observable', () => {
    const numbers = [1, 2, 3]
    expect(mergeObservableArray(numbers)).toEqual(numbers)
  })

  it('should return an observable that emits all values in the array', done => {
    const numbers = [1, 2, 3]
    const number$ = new Subject()
    const merged$ = mergeObservableArray([ number$, 20, 30 ])

    merged$.toArray()
      .subscribe(values => {
        expect(values).toEqual(numbers.map(number => [number, 20, 30]))
        done()
      })

    numbers.forEach(number => number$.next(number))
    number$.complete()
  })
})
