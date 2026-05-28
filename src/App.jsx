import { useEffect, useMemo, useState } from 'react'
import { AppShell } from './components/AppShell.jsx'
import { Card } from './components/Card.jsx'
import { DayDrinksTable } from './components/DayDrinksTable.jsx'
import { Last3MonthsChart } from './components/Last3MonthsChart.jsx'
import { SummaryCards } from './components/SummaryCards.jsx'
import { WeekNavigator } from './components/WeekNavigator.jsx'
import {
  fromISODate,
  getWeekDays,
  startOfWeekMonday,
  toISODate,
} from './utils/dates.js'
import {
  deleteWeek,
  loadTargets,
  loadWeek,
  saveTargets,
  saveWeek,
} from './utils/storage.js'

function sum(values) {
  return values.reduce((acc, n) => acc + n, 0)
}

function isAllZeroByDay(actuals) {
  return (
    (actuals.mon ?? 0) === 0 &&
    (actuals.tue ?? 0) === 0 &&
    (actuals.wed ?? 0) === 0 &&
    (actuals.thu ?? 0) === 0 &&
    (actuals.fri ?? 0) === 0 &&
    (actuals.sat ?? 0) === 0 &&
    (actuals.sun ?? 0) === 0
  )
}

function App() {
  const [view, setView] = useState('dashboard') // 'dashboard' | 'targets'
  const [weekStartISO, setWeekStartISO] = useState(() =>
    toISODate(startOfWeekMonday(new Date())),
  )

  const days = useMemo(() => getWeekDays(fromISODate(weekStartISO)), [weekStartISO])

  const [targets, setTargets] = useState(() => loadTargets())
  const [isEditingTargets, setIsEditingTargets] = useState(false)
  const [draftTargets, setDraftTargets] = useState(() => loadTargets())

  const emptyActuals = useMemo(
    () => ({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }),
    [],
  )

  const [actuals, setActuals] = useState(() => emptyActuals)

  // Load week data when the selected week changes
  useEffect(() => {
    const loaded = loadWeek(weekStartISO)
    if (!loaded) {
      setActuals(emptyActuals)
      return
    }

    // Migration-friendly: older saved weeks may include `targets`, but we now use global targets.
    setActuals({ ...emptyActuals, ...(loaded.actuals ?? loaded ?? {}) })
  }, [weekStartISO, emptyActuals])

  // Save week data whenever actuals change
  useEffect(() => {
    const existing = loadWeek(weekStartISO)
    const isEmptyWeek = isAllZeroByDay(actuals)

    // If the user hasn't entered anything for this week, keep it as "virtual zeros"
    // and don't create a localStorage record until they do.
    if (!existing && isEmptyWeek) return

    // If the week existed and the user cleared it back to all zeros, remove it so it
    // behaves like an unentered week.
    if (existing && isEmptyWeek) {
      deleteWeek(weekStartISO)
      return
    }

    saveWeek(weekStartISO, { actuals, updatedAt: Date.now() })
  }, [weekStartISO, actuals])

  // If targets change (saved), keep draft in sync when not editing
  useEffect(() => {
    if (!isEditingTargets) setDraftTargets(targets)
  }, [targets, isEditingTargets])

  const weekly = useMemo(() => {
    const targetTotal = sum(Object.values(targets))
    const actualTotal = sum(Object.values(actuals))
    return {
      targetTotal,
      actualTotal,
      diff: actualTotal - targetTotal,
    }
  }, [targets, actuals])

  return (
    <AppShell
      title="Alcohol Tracker"
      subtitle="Set your intended drinks for each day, then track what actually happened."
      headerActions={
        <div className="segmented" role="tablist" aria-label="Views">
          <button
            type="button"
            className={`seg-btn ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
            role="tab"
            aria-selected={view === 'dashboard'}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`seg-btn ${view === 'targets' ? 'active' : ''}`}
            onClick={() => setView('targets')}
            role="tab"
            aria-selected={view === 'targets'}
          >
            Targets
          </button>
        </div>
      }
    >
      {view === 'dashboard' ? (
        <>
          <Card
            title="Calendar"
            actions={
              <WeekNavigator
                weekStartISO={weekStartISO}
                onChangeWeekStartISO={setWeekStartISO}
              />
            }
          >
            <div className="muted">
              Pick a week to view/edit. Each week is saved separately.
            </div>
          </Card>

          <div className="grid-2">
            <Card
              title="Actual"
              actions={
                <button className="btn" type="button" onClick={() => setActuals(emptyActuals)}>
                  Clear week
                </button>
              }
            >
              <DayDrinksTable
                label="Actual drinks"
                days={days}
                values={actuals}
                onChange={setActuals}
              />
            </Card>

            <Card title="Weekly summary">
              <SummaryCards weekly={weekly} />
            </Card>
          </div>

          <Card title="Last 3 months">
            <Last3MonthsChart />
          </Card>
        </>
      ) : (
        <Card
          title="Weekly targets (applies to all weeks)"
          actions={
            isEditingTargets ? (
              <div className="actions">
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    setDraftTargets(targets)
                    setIsEditingTargets(false)
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    saveTargets(draftTargets)
                    setTargets(draftTargets)
                    setIsEditingTargets(false)
                  }}
                >
                  Save targets
                </button>
              </div>
            ) : (
              <button className="btn" type="button" onClick={() => setIsEditingTargets(true)}>
                Edit targets
              </button>
            )
          }
        >
          <div className="muted" style={{ marginBottom: 12 }}>
            These targets are your benchmark for every week (past and future).
          </div>
          <DayDrinksTable
            label="Target drinks"
            days={days}
            values={draftTargets}
            onChange={setDraftTargets}
            disabled={!isEditingTargets}
          />
        </Card>
      )}
    </AppShell>
  )
}

export default App
