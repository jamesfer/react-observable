import { createElement as createReactElement } from 'react'
import { isObservable } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  castObservable,
  mergeObservableArray,
  mergeObservableObject
} from './utils'

/**
 * Substitute jsx renderer.
 * @param {string|function} type
 * @param {object} props
 * @param {string|Observable} children
 */
export function createElement (type, props, ...children) {
  // Create an observable from props
  const propsObservable$ = mergeObservableObject(props)

  // Create an observable for the whole element
  const elementObservable$ = mergeObservableArray([
    type,
    propsObservable$,
    ...children
  ])

  if (isObservable(elementObservable$)) {
    // Cast to an observable just in case it doesn't have the pipe method
    return castObservable(elementObservable$).pipe(
      map(([ type, props, ...children ]) => {
        return createReactElement(type, props, ...children)
      })
    )
  }
  return createReactElement(type, props, ...children)
}
