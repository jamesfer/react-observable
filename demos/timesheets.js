import { Observable, Subject } from 'rxjs'
import ObsReact from '../src/observable-react'
import React from 'react'
import ReactDOM from 'react-dom'
import { padStart } from 'lodash'

/** @jsx ObsReact.createElement */



/**
 * Timesheet model
 */

const second = 1000
const minute = 60 * second
const hour = 60 * minute


class TimesheetModel {
  constructor(name) {
    this.interval = 10;

    // Create a random id for this timesheet
    this.id = Math.random().toString(36).substr(2, 5)

    this.name$ = Observable.of(name)

    // Controls if this timesheet is running or not
    this.state$ = new Subject()

    // Represents if the timesheet is currently running or not
    this.running$ = this.state$.startWith(true)
      .distinctUntilChanged()

    // Emits when the timer starts
    this.started$ = this.running$.filter(isRunning => isRunning)

    // Emits when the timer stops
    this.stopped$ = this.running$.filter(isRunning => !isRunning)

    // Emits the current length of the timesheet in milliseconds
    this.duration$ = this.started$.switchMap(() => {
      return Observable.interval(this.interval).takeUntil(this.stopped$)
    })
      .scan(totalTime => totalTime + this.interval, 0)

    this.hours$ = this.duration$.map(time => {
      return Math.floor(time / hour)
    })
    this.minutes$ = this.duration$.map(time => {
      const hours = Math.floor((time % hour) / minute)
      return padStart(hours, 2, '0')
    })
    this.seconds$ = this.duration$.map(time => {
      const seconds = Math.floor((time % minute) / second)
      return padStart(seconds, 2, '0')
    })
  }
}






/**
 * Timesheet component
 */

const Timesheet = ObsReact.component(({ timesheet }) => {
  const button$ = timesheet.running$.map(isRunning => {
    if (isRunning) {
      // Pause button
      return <button onClick={() => timesheet.state$.next(false)}>
        &#10073; &#10073;
      </button>
    }
    // Play button
    return <button onClick={() => timesheet.state$.next(true)}>
      &#9654;
    </button>
  })

  return <div className="timesheet">
    <strong className="timesheet-name">{ timesheet.name$ }</strong>
    <span className="spacer"></span>
    <span className="timesheet-time">
      { timesheet.hours$ }:{ timesheet.minutes$ }:{ timesheet.seconds$ }
    </span>
    {button$}
  </div>
});






/**
 * Timesheet list component
 */


/**
 * Creates a new timesheet
 * @param {Subject} timesheets$
 */
function createTimesheet(timesheets$) {
  const now = new Date()
  const name = now.toLocaleTimeString('en-US')
  timesheets$.next(new TimesheetModel(name))
}


const TimesheetList = ObsReact.component(() => {
  // Emits each individual timesheet
  const timesheets$ = new Subject()

  // Collects all of the timesheets into an array
  const timesheetList$ = timesheets$.scan((list, timesheet) => {
    list.push(timesheet)
    return list
  }, []).startWith([])

  // Converts the list of timesheets into real elements
  const timesheetDom$ = timesheetList$.map(timesheets => {
    if (timesheets.length) {
      return timesheets.map(timesheet => {
        return <Timesheet key={timesheet.id} timesheet={timesheet} />
      })
    }

    return <div className="hint">Press New to create a timesheet</div>
  })

  return <main>
    <button className="new-button" onClick={() => createTimesheet(timesheets$)}>
      New
    </button>

    <h1>Timesheets</h1>

    <div className="timesheet-list">
      { timesheetDom$ }
    </div>
  </main>
});




ReactDOM.render(
  React.createElement(TimesheetList, null),
  document.getElementById('root')
)
