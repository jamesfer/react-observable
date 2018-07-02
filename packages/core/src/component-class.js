import { Component as ReactComponent } from 'react'
import { Subject } from 'rxjs'
import {
  distinctUntilChanged,
  first,
  startWith,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators/index'
import { castObservable } from './utils'

export class Component extends ReactComponent {
  constructor (props, context) {
    super(props, context)
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
  }

  componentDidMount () {
    this.component$ = this._subscribeToRender()
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
    this._subscribeToRender()
    return this.state.element
  }

  _subscribeToRender () {
    this.component$ = castObservable(this.render$())

    // Update the state whenever the observable outputs
    this.component$
      .pipe(
        distinctUntilChanged(),
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
  }
}
