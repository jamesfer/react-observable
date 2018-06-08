import ObsReact from 'react-with-observables'
import { map } from 'rxjs/operators'

function nextState (timesheet, state) {
  return () => timesheet.state$.next(state)
}

const PlayButton = ObsReact.component(() => ({ timesheet }) =>
  timesheet.running$.pipe(
    map(isRunning => (
      <button onClick={nextState(timesheet, !isRunning)}>
        {isRunning ? '\u2759\u2759' : '\u25B6'}
      </button>
    ))
  )
)

export default PlayButton
