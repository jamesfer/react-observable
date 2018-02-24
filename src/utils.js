import { map, zipObject, some, unzip, toPairs } from 'lodash'
import { Observable } from 'rxjs'


/**
 * Merges all observable values of an object into a single observable.
 * The resulting observable emits every time one of the input values does.
 * If none of the values are observables, then will return the array unmodified.
 *
 * @param {Object} valueObject
 * @return {Observable}
 */
export function mergeObservableObject (valueObject) {
  // Extract keys and values of the object
  const [ keys, values ] = unzip(toPairs(valueObject))

  // Create an observable from all values
  const valuesObservable$ = mergeObservableArray(values)

  if (valuesObservable$ instanceof Observable) {
    return valuesObservable$.map(values => zipObject(keys, values))
  }

  // When none of the values were observables, we should return the original
  // object unchanged.
  return valueObject
}


/**
 * Merges all observable values of an array into a single observable.
 * The resulting observable emits every time one of the input values does.
 * If none of the values are observables, then will return the array unmodified.
 *
 * @param {Array} values
 * @return {Observable|Array}
 */
export function mergeObservableArray (values) {
  // Return the array unchanged if no values are observable
  if (!some(values, value => value instanceof Observable)) {
    return values
  }

  return Observable.combineLatest(map(values, value => {
    return value instanceof Observable ? value : Observable.of(value)
  }))
    // .startWith(map(values, value => value instanceof Observable ? null : value))
}
