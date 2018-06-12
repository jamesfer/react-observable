import ObsReact from 'react-with-observables'
import PlayButton from './PlayButton'
import Time from './Time'

const Timesheet = ObsReact.component(() => ({ timesheet }) => (
  <div className='timesheet tile tile-centered'>
    <div className='tile-content'>
      <div className='tile-title'>{timesheet.name}</div>
      <div className='tile-subtitle text-gray'>
        <Time ms={timesheet.duration$} />
      </div>
    </div>
    <div className='tile-action'>
      <PlayButton timesheet={timesheet} />
    </div>
  </div>
))

export default Timesheet
