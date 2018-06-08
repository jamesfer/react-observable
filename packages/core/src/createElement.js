import { createElement as createReactElement } from 'react'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { mergeObservableArray, mergeObservableObject } from './utils'

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

  if (elementObservable$ instanceof Observable) {
    return elementObservable$.pipe(
      map(([ type, props, ...children ]) => {
        return createReactElement(type, props, ...children)
      })
    )
  }
  return createReactElement(type, props, ...children)
}
