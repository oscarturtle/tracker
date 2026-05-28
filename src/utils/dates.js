import { DAYS } from '../constants/days.js'

function pad2(n) {
  return String(n).padStart(2, '0')
}

// Use local dates (not UTC) to match what people expect on a calendar.
export function toISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function fromISODate(iso) {
  // Creates a local Date at midnight.
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function addWeeks(date, weeks) {
  return addDays(date, weeks * 7)
}

// Monday-start week. Returns the Monday of the week containing `date`.
export function startOfWeekMonday(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun,1=Mon,...6=Sat
  const diff = (day + 6) % 7 // Mon->0, Tue->1, ... Sun->6
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)
  return d
}

export function formatShort(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function getWeekDays(weekStartMonday) {
  return DAYS.map((d, idx) => {
    const date = addDays(weekStartMonday, idx)
    return {
      key: d.key,
      label: d.label,
      date,
      iso: toISODate(date),
    }
  })
}

