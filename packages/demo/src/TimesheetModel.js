import { interval, defer, of, Subject } from 'rxjs'
import { startWith, distinctUntilChanged, switchMapTo, map, filter, takeUntil, mapTo, share, merge } from 'rxjs/operators'

/******************************************
 * Timesheet model
 ******************************************/

const intervalTime = 100

function makeInterval (until$) {
  return interval(intervalTime).pipe(
    takeUntil(until$),
    mapTo(intervalTime)
  )
}

export default class TimesheetModel {
  constructor (name) {
    this.name = name
    this.duration = 0

    // Create a random id for this timesheet
    this.id = Math.random().toString(36).substr(2, 8)

    // Controls if this timesheet is running or not
    this.state$ = new Subject()

    // Represents if the timesheet is currently running or not
    this.running$ = this.state$.pipe(
      startWith(true),
      distinctUntilChanged()
    )

    // Emits when the timer starts or stops
    this.started$ = this.running$.pipe(filter(running => running))
    this.stopped$ = this.running$.pipe(filter(running => !running))

    // Emits the current length of the timesheet in milliseconds
    this.duration$ = this.started$.pipe(
      switchMapTo(makeInterval(this.stopped$)),
      map(interval => {
        // Update a local record of the duration
        this.duration += interval
        return this.duration
      }),
      // Use share to prevent multiple subscriptions from triggering the above
      // side effect multiple times.
      share(),
      // Merge with an observable that emits the current duration immediately
      // This is so each new subscriber is immediately sent the current duration
      merge(defer(() => of(this.duration)))
    )
  }
}
