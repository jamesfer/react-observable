import { Subject } from 'rxjs'
import { scan, map, startWith } from 'rxjs/operators'
import ObsReact from 'react-with-observables'
import Timesheet from './Timesheet'
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

  return (
    <main>
      <button className='new-button' onClick={() => newTimesheet(timesheets$)}>
        New
      </button>

      <h1>Timesheets</h1>

      <div className='timesheet-list'>
        {timesheetList$.pipe(
          map(list =>
            list.map(timesheet =>
              <Timesheet key={timesheet.id} timesheet={timesheet} />
            )
          ),
          startWith(<div className='hint'>Press New to create a timesheet</div>)
        )}
      </div>
    </main>
  )
})
