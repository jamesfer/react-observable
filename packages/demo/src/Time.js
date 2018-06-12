import ObsReact from 'react-with-observables'
import { toHours, toMins, toSecs } from './time-utils'

export default ObsReact.component(() => ({ ms }) => (
  `${toHours(ms)}:${toMins(ms)}:${toSecs(ms)}`
))
