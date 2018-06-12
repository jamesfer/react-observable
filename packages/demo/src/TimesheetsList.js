import { Subject, combineLatest } from 'rxjs'
import { scan, map, startWith, switchMap, debounceTime, tap, throttleTime } from 'rxjs/operators'
import ObsReact from 'react-with-observables'
import Timesheet from './Timesheet'
import Time from './Time'
import TimesheetModel from './TimesheetModel'

function newTimesheet (timesheets$) {
  const name = new Date().toLocaleTimeString('en-US')
  timesheets$.next(new TimesheetModel(name))
}

export default ObsReact.component(() => {
  // Emits each individual timesheet
  const timesheets$ = new Subject()

  // Collects all of the timesheets into an array
  const timesheetList$ = timesheets$.pipe(
    scan((all, next) => [...all, next], [])
  )

  // The timesheet components to render
  const timesheetComponents$ = timesheetList$.pipe(
    map(list =>
      list.map(timesheet =>
        <Timesheet key={timesheet.id} timesheet={timesheet} />
      )
    ),
    startWith(<div className='hint'>Press New to create a timesheet</div>)
  )

  // Tracks the total time for all timesheets
  const totalTime$ = timesheetList$.pipe(
    // Map each of the timesheet lists to a list of durations
    map(timesheets => timesheets.map(timesheet => timesheet.duration$)),
    // Flatten the array of observables into an array of numbers
    switchMap(durations$ => combineLatest(...durations$)),
    throttleTime(50),
    // Sum the numbers
    map(durations => durations.reduce((a, b) => a + b)),
    startWith(0)
  )

  return (
    <div>
      <main className='card'>
        <div className='card-header'>
          <button className='btn btn-link btn-action circle float-right'
            onClick={() => newTimesheet(timesheets$)}>
            <i className='icon icon-plus' />
          </button>

          <h1 className='card-title h3'>Timesheets</h1>
        </div>

        <div className='card-body'>
          {timesheetComponents$}
        </div>

        <div className='card-footer h6'>
          Total <Time ms={totalTime$} />
        </div>
      </main>

      <footer className='footer text-gray'>
        <span className='float-right'>
          <span>Styled with </span>
          <a href='https://github.com/picturepan2/spectre'>Spectre.css</a>
        </span>
      </footer>
    </div>
  )
})
