import { isArray, map as _map, some, toPairs, unzip, zipObject } from 'lodash'
import { Observable, combineLatest, of, isObservable } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * Casts a value to an rxjs observable if it is not one.
 * @param {*} value
 * @returns {Observable}
 */
export function castObservable (value) {
  return value instanceof Observable ? value : of(value)
}

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

  if (isObservable(valuesObservable$)) {
    // Cast to an observable just in case it doesn't have the pipe method
    return castObservable(valuesObservable$).pipe(
      map(values => zipObject(keys, values))
    )
  }

  // When none of the values were observables, we should return the original
  // object unchanged.
  return valueObject
}

function isArrayOrObservable (value) {
  return isObservable(value) ||
    (isArray(value) && some(value, isArrayOrObservable))
}

function combineArrayToObservable (values) {
  if (isObservable(values)) {
    return values
  }

  if (isArray(values)) {
    return combineLatest(_map(values, combineArrayToObservable))
  }

  return of(values)
}

/**
 * Merges all observable values of an array into a single observable.
 * The resulting observable emits every time one of the input values does.
 * If none of the values are observables, then will return the array unmodified.
 *
 * @param {Array} values
 * @param recursive
 * @return {Observable|Array}
 */
export function mergeObservableArray (values, recursive = false) {
  // Return the array unchanged if no values are observable
  if (!isArrayOrObservable(values)) {
    return values
  }

  return combineArrayToObservable(values)
}
