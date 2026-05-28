import { DAYS } from '../constants/days.js'

function maxOf(values) {
  return values.reduce((acc, n) => (n > acc ? n : acc), 0)
}

export function ProgressChart({ targets, actuals }) {
  const tValues = DAYS.map((d) => targets[d.key] ?? 0)
  const aValues = DAYS.map((d) => actuals[d.key] ?? 0)
  const max = Math.max(1, maxOf([...tValues, ...aValues]))

  return (
    <div className="chart">
      <div className="chart-legend">
        <span className="legend-item">
          <span className="dot dot-target" /> Target
        </span>
        <span className="legend-item">
          <span className="dot dot-actual" /> Actual
        </span>
      </div>

      <div className="chart-bars" role="list" aria-label="Weekly progress chart">
        {DAYS.map((d) => {
          const t = targets[d.key] ?? 0
          const a = actuals[d.key] ?? 0
          const tPct = (t / max) * 100
          const aPct = (a / max) * 100

          return (
            <div className="bar-group" key={d.key} role="listitem">
              <div className="bar-label">{d.label}</div>
              <div className="bar-track" aria-hidden="true">
                <div className="bar bar-target" style={{ width: `${tPct}%` }} />
                <div className="bar bar-actual" style={{ width: `${aPct}%` }} />
              </div>
              <div className="bar-values">
                <span className="muted">T {t}</span>
                <span className="muted">A {a}</span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="hint">
        This is a simple “bar chart” built with divs (easy to read). We can swap
        it for a chart library later if you want.
      </p>
    </div>
  )
}

