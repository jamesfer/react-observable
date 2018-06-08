import { padStart } from 'lodash'
import { interval, Subject } from 'rxjs'
import { startWith, distinctUntilChanged, switchMapTo, scan, map, filter, takeUntil, mapTo } from 'rxjs/operators'

/******************************************
 * Timesheet model
 ******************************************/

const intervalTime = 10
const second = 1000
const minute = 60 * second
const hour = 60 * minute

function toHours (time) {
  return '' + Math.floor(time / hour)
}

function toMins (time) {
  return padStart(Math.floor((time % hour) / minute), 2, '0')
}

function toSecs (time) {
  return padStart(Math.floor((time % minute) / second), 2, '0')
}

function makeInterval (until$) {
  return interval(intervalTime).pipe(
    takeUntil(until$),
    mapTo(intervalTime)
  )
}

export default class TimesheetModel {
  constructor (name) {
    this.name = name

    // Create a random id for this timesheet
    this.id = Math.random().toString(36).substr(2, 8)

    // Controls if this timesheet is running or not
    this.state$ = new Subject()

    // Represents if the timesheet is currently running or not
    this.running$ = this.state$.pipe(
      startWith(true),
      distinctUntilChanged()
    )

    // Emits when the timer starts
    this.started$ = this.running$.pipe(filter(running => running))
    this.stopped$ = this.running$.pipe(filter(running => !running))

    // Emits the current length of the timesheet in milliseconds
    this.duration$ = this.started$.pipe(
      switchMapTo(makeInterval(this.stopped$)),
      scan((sum, time) => sum + time, 0)
    )

    this.hours$ = this.duration$.pipe(map(toHours))
    this.minutes$ = this.duration$.pipe(map(toMins))
    this.seconds$ = this.duration$.pipe(map(toSecs))
  }
}
