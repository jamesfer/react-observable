/**
 * Utility class used in testing.
 * Watches the value of an observable to make asserting things about it easier.
 */
export class Watcher {
  constructor (observable) {
    this.count = 0
    this.value = undefined
    this.allValues = []
    this.observable = observable
    this.completed = false
    this.finished = false
    this.errored = false
    this.error = undefined

    this.subscription = observable.subscribe(
      this._onNext.bind(this),
      this._onError.bind(this),
      this._onComplete.bind(this)
    )
  }

  _onNext (subscriptionValue) {
    this.count += 1
    this.value = subscriptionValue
    this.allValues.push(subscriptionValue)
  }

  _onError (error) {
    this.errored = true
    this.finished = true
    this.error = error
  }

  _onComplete () {
    this.completed = true
    this.finished = true
  }

  unsubscribe () {
    this.subscription()
  }
}
