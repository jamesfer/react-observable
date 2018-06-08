import { Component } from 'react'
import { Subject } from 'rxjs'
import { first, startWith, takeUntil, withLatestFrom, map, distinctUntilChanged } from 'rxjs/operators'
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
      this.untilUnmount,
    )
    this.component$ = this._makeComponent(functionComponent)
  }

  componentDidMount () {
    this._hooks.mounted$.next(true)
    this._hooks.componentDidMount$.next()
  }

  shouldComponentUpdate (nextProps, nextState) {
    this._hooks.props$.next(nextProps)
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
    let component = functionComponent(this)

    if (isFunction(component)) {
      component = this.props$.pipe(map(component))
    }

    // Subscription is automatically cleaned up when the component is
    // unmounted
    castObservable(component).pipe(
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
    return castObservable(component)
  }
}
