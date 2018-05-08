/** @jsx ObsReact.createElement */
import { Observable, Subject } from 'rxjs'
import React, { component } from '../src/index'
import ReactDOM from 'react-dom'
import { padStart, concat, ary } from 'lodash'

/******************************************
 * Timesheet model
 ******************************************/

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

function interval$ (until$) {
  var interval = 10
  return Observable.interval(interval).takeUntil(until$).mapTo(interval)
}

class TimesheetModel {
  constructor (name) {
    this.interval = 10

    // Create a random id for this timesheet
    this.id = Math.random().toString(36).substr(2, 5)

    this.name = name

    // Controls if this timesheet is running or not
    this.state$ = new Subject()

    // Represents if the timesheet is currently running or not
    this.running$ = this.state$.startWith(true).distinctUntilChanged()

    // Emits when the timer starts
    this.started$ = this.running$.filter(isRunning => isRunning)
    this.stopped$ = this.running$.filter(isRunning => !isRunning)

    // Emits the current length of the timesheet in milliseconds
    this.duration$ = this.started$.switchMap(() => interval$(this.stopped$))
      .scan((total, additional) => total + additional, 0)

    this.hours$ = this.duration$.map(toHours)
    this.minutes$ = this.duration$.map(toMins)
    this.seconds$ = this.duration$.map(toSecs)
  }
}

/******************************************
 * Timesheet component
 ******************************************/

const PlayButton = component(({ timesheet }) => {
  const nextState = state => () => timesheet.state$.next(state)

  // TODO Maybe this won't work
  return timesheet.running$.map(isRunning => {
    return isRunning
      ? <button onClick={nextState(false)}>&#10073;&#10073;</button>
      : <button onClick={nextState(true)}>&#9654;</button>
  })
})

const Timesheet = component(({ timesheet }) => {
  return (
    <div className='timesheet'>
      <strong className='timesheet-name'>{ timesheet.name }</strong>
      <span className='spacer' />
      <span className='timesheet-time'>
        { timesheet.hours$ }:{ timesheet.minutes$ }:{ timesheet.seconds$ }
      </span>
      <PlayButton timesheet={timesheet} />
    </div>
  )
})

/******************************************
 * Timesheet list component
 ******************************************/

/**
 * Creates a new timesheet
 * @param {Subject} timesheets$
 */
function createTimesheet (timesheets$) {
  const name = new Date().toLocaleTimeString('en-US')
  timesheets$.next(new TimesheetModel(name))
}

const TimesheetList = component(() => {
  // Emits each individual timesheet
  const timesheets$ = new Subject()

  // Collects all of the timesheets into an array
  const timesheetList$ = timesheets$.scan(ary(concat, 2), [])

  // Converts the list of timesheets into real elements
  const timesheetDom$ = timesheetList$.map(timesheets => {
    return timesheets.map(timesheet => {
      return <Timesheet key={timesheet.id} timesheet={timesheet} />
    })
  })
    .startWith(<div className='hint'>Press New to create a timesheet</div>)

  return (
    <main>
      <button className='new-button' onClick={() => createTimesheet(timesheets$)}>
        New
      </button>

      <h1>Timesheets</h1>

      <div className='timesheet-list'>
        { timesheetDom$ }
      </div>
    </main>
  )
})

ReactDOM.render(<TimesheetList />, document.getElementById('root'))
