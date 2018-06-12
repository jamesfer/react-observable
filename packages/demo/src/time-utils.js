import { padStart } from 'lodash'

const second = 1000
const minute = 60 * second
const hour = 60 * minute

export function toHours (time) {
  return '' + Math.floor(time / hour)
}

export function toMins (time) {
  return padStart(Math.floor((time % hour) / minute), 2, '0')
}

export function toSecs (time) {
  return padStart(Math.floor((time % minute) / second), 2, '0')
}
