import { Component } from 'react'
import { Subject } from 'rxjs'
import { first, startWith, takeUntil, withLatestFrom, switchMap, distinctUntilChanged } from 'rxjs/operators'
import { castObservable } from './utils'
import { isFunction } from 'lodash'

export class ObservableReactComponent extends Component {
  constructor (props, functionComponent) {
    super(props)
    this.state = { element: null }
    this._hooks = {
      props$: new Subject(),
      mounted$: new Subject(),
      componentDidMount$: new Subject(),
      componentWillUnmount$: new Subject(),
      componentDidUpdate$: new Subject()
    }
    this.untilUnmount = takeUntil(this._hooks.componentWillUnmount$)
    this.hooks = {
      mounted$: this.untilUnmount(this._hooks.mounted$).pipe(startWith(false)),
      componentDidMount$: this.untilUnmount(this._hooks.componentDidMount$),
      componentDidUpdate$: this.untilUnmount(this._hooks.componentDidUpdate$),
      componentWillUnmount$: this._hooks.componentWillUnmount$.pipe(first())
    }
    this.props$ = this._hooks.props$.pipe(
      startWith(this.props),
      distinctUntilChanged(),
      this.untilUnmount
    )
    this.component$ = this._makeComponent(functionComponent)
  }

  componentDidMount () {
    this._hooks.mounted$.next(true)
    this._hooks.componentDidMount$.next()
  }

  shouldComponentUpdate (nextProps, nextState) {
    this._hooks.props$.next(nextProps)
    return true
  }

  componentDidUpdate (prevProps, prevState) {
    this._hooks.componentDidUpdate$.next({ prevProps, prevState })
  }

  componentWillUnmount () {
    this._hooks.mounted$.next(false)
    this._hooks.componentWillUnmount$.next()
  }

  render () {
    return this.state.element
  }

  _makeComponent (functionComponent) {
    // Initialize the component
    const component$ = this._runFunctionComponent(functionComponent)

    // Subscription is automatically cleaned up when the component is
    // unmounted
    component$.pipe(
      withLatestFrom(this.hooks.mounted$),
      this.untilUnmount
    )
      .subscribe(([element, mounted]) => {
        if (mounted) {
          this.setState({ element })
        } else {
          this.state = { element }
        }
      })
    return component$
  }

  /**
   * Runs a function component and returns an observable that will emit whenever
   * it changes.
   * @param functionComponent
   * @returns {Observable}
   * @private
   */
  _runFunctionComponent (functionComponent) {
    const component = functionComponent(this)

    if (isFunction(component)) {
      return this.props$.pipe(
        switchMap(props => castObservable(component(props)))
      )
    }
    return castObservable(component)
  }
}
