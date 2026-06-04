import { useState } from 'react'
import { loadAll } from '../utils/storage.js'
import { addWeeks, formatShort, startOfWeekMonday, toISODate } from '../utils/dates.js'

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

function buildSeries(endWeek) {
  const all = loadAll()
  const weeks = all.weeks ?? {}
  const startWeek = addWeeks(endWeek, -3)

  const points = []
  for (let d = startWeek; d <= endWeek; d = addWeeks(d, 1)) {
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

export function Last3MonthsChart({ liveWeekISO, liveActuals }) {
  const thisWeek = startOfWeekMonday(new Date())
  const [endWeek, setEndWeek] = useState(thisWeek)

  const isCurrentWeek = toISODate(endWeek) === toISODate(thisWeek)

  function shiftWeeks(delta) {
    setEndWeek((prev) => addWeeks(prev, delta))
  }

  // Read from localStorage for all weeks, then override the currently-viewed
  // week with live state so the chart updates instantly as drinks are entered.
  const points = buildSeries(endWeek).map((p) =>
    p.weekStartISO === liveWeekISO
      ? { ...p, value: sumActuals(liveActuals) }
      : p
  )
  const max = Math.max(1, ...points.map((p) => p.value))

  const W = 640
  const H = 220
  const PAD = 18
  const d = pathFromPoints(points, W, H, PAD)

  const latest = points.at(-1)
  const start = points.at(0)

  return (
    <div className="chart">
      <div className="chart-nav">
        <div className="chart-legend">
          <span className="legend-item">
            <span className="dot dot-actual" /> Total drinks per week
          </span>
          <span className="muted">{start?.label}–{latest?.label}</span>
        </div>
        <div className="chart-nav-btns">
          <button className="btn" type="button" onClick={() => shiftWeeks(-1)}>← Prev</button>
          <button className="btn" type="button" onClick={() => shiftWeeks(1)} disabled={isCurrentWeek}>Next →</button>
        </div>
      </div>

      <div className="line-wrap" role="img" aria-label="Total drinks per week">
        <div className="line-svg-wrap">
          <svg className="line" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <path className="line-grid" d={`M ${PAD} ${PAD} L ${PAD} ${H - PAD} L ${W - PAD} ${H - PAD}`} />
            <path className="line-path" d={d} />
            {points.map((p, i) => {
              const x = PAD + ((W - PAD * 2) * i) / Math.max(1, points.length - 1)
              const y = PAD + (H - PAD * 2) - ((H - PAD * 2) * p.value) / max
              return <circle key={p.weekStartISO} className="line-dot" cx={x} cy={y} r="3.2" />
            })}
          </svg>

          {points.map((p, i) => {
            if (p.value === 0) return null
            const xPct = (PAD + ((W - PAD * 2) * i) / Math.max(1, points.length - 1)) / W * 100
            const yPct = (PAD + (H - PAD * 2) - ((H - PAD * 2) * p.value) / max) / H * 100
            return (
              <span
                key={p.weekStartISO}
                className="line-value"
                style={{ left: `${xPct}%`, top: `calc(${yPct}% - 20px)` }}
              >
                {p.value}
              </span>
            )
          })}
        </div>

        <div className="x-axis">
          {points.map((p) => (
            <span key={p.weekStartISO} className="x-label">{p.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

