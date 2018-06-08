import ObsReact from 'react-with-observables'
import PlayButton from './PlayButton'

const Timesheet = ObsReact.component(() => ({ timesheet }) => (
  <div className='timesheet'>
    <strong className='timesheet-name'>{ timesheet.name }</strong>
    <span className='spacer' />
    <span className='timesheet-time'>
      { timesheet.hours$ }:{ timesheet.minutes$ }:{ timesheet.seconds$ }
    </span>
    <PlayButton timesheet={timesheet} />
  </div>
))

export default Timesheet
