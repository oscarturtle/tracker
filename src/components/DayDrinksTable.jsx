import { formatShort } from '../utils/dates.js'

function clampInt(value, min, max) {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, Math.trunc(value)))
}

export function DayDrinksTable({ label, days, values, onChange, disabled }) {
  function setDay(key, nextValue) {
    onChange((prev) => ({ ...prev, [key]: nextValue }))
  }

  return (
    <div className="table">
      <div className="table-head">
        <span className="muted">{label}</span>
        <span className="muted right">drinks</span>
      </div>

      <div className="table-rows" role="list">
        {days.map((d) => {
          const value = values[d.key] ?? 0
          return (
            <div className="row" role="listitem" key={d.key}>
              <div className="row-left">
                <div className="day">{d.label}</div>
                <div className="date">{formatShort(d.date)}</div>
              </div>
              <div className="row-right">
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={99}
                  value={value}
                  disabled={disabled}
                  onChange={(e) => {
                    const parsed = Number(e.target.value)
                    setDay(d.key, clampInt(parsed, 0, 99))
                  }}
                  aria-label={`${label} for ${d.label}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

