function formatSigned(n) {
  if (n === 0) return '0'
  return n > 0 ? `+${n}` : `${n}`
}

export function SummaryCards({ weekly }) {
  const isOver = weekly.diff > 0
  const diffLabel = isOver ? 'Over target' : weekly.diff < 0 ? 'Under target' : 'On target'

  return (
    <div className="summary">
      <div className="summary-card">
        <div className="summary-label">Target total</div>
        <div className="summary-value">{weekly.targetTotal}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Actual total</div>
        <div className="summary-value">{weekly.actualTotal}</div>
      </div>

      <div className={`summary-card ${isOver ? 'danger' : 'ok'}`}>
        <div className="summary-label">{diffLabel}</div>
        <div className="summary-value">{formatSigned(weekly.diff)}</div>
      </div>
    </div>
  )
}

