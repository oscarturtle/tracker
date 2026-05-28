import { formatShort, fromISODate, startOfWeekMonday, toISODate } from '../utils/dates.js'

export function WeekNavigator({ weekStartISO, onChangeWeekStartISO }) {
  const weekStart = fromISODate(weekStartISO)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  function go(deltaDays) {
    const d = fromISODate(weekStartISO)
    d.setDate(d.getDate() + deltaDays)
    onChangeWeekStartISO(toISODate(startOfWeekMonday(d)))
  }

  function goThisWeek() {
    onChangeWeekStartISO(toISODate(startOfWeekMonday(new Date())))
  }

  return (
    <div className="week-nav">
      <div className="week-range">
        <span className="week-range-strong">
          {formatShort(weekStart)}–{formatShort(weekEnd)}
        </span>
        <span className="week-range-muted"> (Mon–Sun)</span>
      </div>

      <div className="week-nav-actions">
        <button className="btn" type="button" onClick={() => go(-7)}>
          ← Prev
        </button>
        <button className="btn" type="button" onClick={goThisWeek}>
          This week
        </button>
        <button className="btn" type="button" onClick={() => go(7)}>
          Next →
        </button>
      </div>
    </div>
  )
}

