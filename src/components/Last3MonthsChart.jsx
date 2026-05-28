import { loadAll } from '../utils/storage.js'
import { addWeeks, formatShort, fromISODate, startOfWeekMonday, toISODate } from '../utils/dates.js'

function sumActuals(actuals) {
  return (
    (actuals.mon ?? 0) +
    (actuals.tue ?? 0) +
    (actuals.wed ?? 0) +
    (actuals.thu ?? 0) +
    (actuals.fri ?? 0) +
    (actuals.sat ?? 0) +
    (actuals.sun ?? 0)
  )
}

function buildSeries() {
  const all = loadAll()
  const weeks = all.weeks ?? {}

  const end = startOfWeekMonday(new Date())
  const start = new Date(end)
  start.setMonth(start.getMonth() - 3)
  const startWeek = startOfWeekMonday(start)

  const points = []
  for (let d = startWeek; d <= end; d = addWeeks(d, 1)) {
    const weekStartISO = toISODate(d)
    const week = weeks[weekStartISO]
    const actuals = week?.actuals ?? null
    points.push({
      weekStartISO,
      label: formatShort(d),
      value: actuals ? sumActuals(actuals) : 0,
    })
  }

  return points
}

function pathFromPoints(points, w, h, pad) {
  if (points.length === 0) return ''
  const max = Math.max(1, ...points.map((p) => p.value))
  const innerW = w - pad * 2
  const innerH = h - pad * 2

  return points
    .map((p, i) => {
      const x = pad + (innerW * i) / Math.max(1, points.length - 1)
      const y = pad + innerH - (innerH * p.value) / max
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export function Last3MonthsChart() {
  const points = buildSeries()
  const max = Math.max(1, ...points.map((p) => p.value))

  const W = 640
  const H = 220
  const PAD = 18
  const d = pathFromPoints(points, W, H, PAD)

  const latest = points.at(-1)
  const start = points.at(0)

  return (
    <div className="chart">
      <div className="chart-legend">
        <span className="legend-item">
          <span className="dot dot-actual" /> Total drinks per week
        </span>
        <span className="muted">
          {start?.label}–{latest?.label}
        </span>
      </div>

      <div className="line-wrap" role="img" aria-label="Total drinks per week for last 3 months">
        <svg className="line" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <path className="line-grid" d={`M ${PAD} ${PAD} L ${PAD} ${H - PAD} L ${W - PAD} ${H - PAD}`} />
          <path className="line-path" d={d} />
          {points.map((p, i) => {
            const x = PAD + ((W - PAD * 2) * i) / Math.max(1, points.length - 1)
            const y = PAD + (H - PAD * 2) - ((H - PAD * 2) * p.value) / max
            return <circle key={p.weekStartISO} className="line-dot" cx={x} cy={y} r="3.2" />
          })}
        </svg>
      </div>

      <div className="line-meta">
        <div className="muted">Max: {max}</div>
        <div className="muted">
          This week ({latest?.weekStartISO}): <span className="strong">{latest?.value ?? 0}</span>
        </div>
      </div>

      <p className="hint">
        Weeks with no entries are shown as 0. (We store actuals per week, so this chart is fast and simple.)
      </p>
    </div>
  )
}

