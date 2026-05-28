const STORAGE_KEY = 'alcoholTracker.v1'
const DEFAULT_TARGETS = {
  mon: 0,
  tue: 0,
  wed: 0,
  thu: 1,
  fri: 2,
  sat: 2,
  sun: 0,
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function loadAll() {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? safeJsonParse(raw) : null
  if (!parsed || typeof parsed !== 'object') return { weeks: {}, targets: DEFAULT_TARGETS }

  const weeks = parsed.weeks && typeof parsed.weeks === 'object' ? parsed.weeks : {}
  const targets =
    parsed.targets && typeof parsed.targets === 'object'
      ? { ...DEFAULT_TARGETS, ...parsed.targets }
      : DEFAULT_TARGETS

  return { ...parsed, weeks, targets }
}

export function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadWeek(weekStartISO) {
  const all = loadAll()
  const week = all.weeks?.[weekStartISO]
  if (!week || typeof week !== 'object') return null
  return week
}

export function saveWeek(weekStartISO, weekData) {
  const all = loadAll()
  const next = {
    ...all,
    weeks: {
      ...(all.weeks ?? {}),
      [weekStartISO]: weekData,
    },
  }
  saveAll(next)
}

export function deleteWeek(weekStartISO) {
  const all = loadAll()
  if (!all.weeks?.[weekStartISO]) return
  const { [weekStartISO]: _removed, ...rest } = all.weeks
  saveAll({ ...all, weeks: rest })
}

export function loadTargets() {
  const all = loadAll()
  return all.targets ?? DEFAULT_TARGETS
}

export function saveTargets(targets) {
  const all = loadAll()
  const next = {
    ...all,
    targets: { ...DEFAULT_TARGETS, ...(targets ?? {}) },
  }
  saveAll(next)
}


