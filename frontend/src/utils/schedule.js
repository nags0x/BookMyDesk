import { format, parseISO, differenceInCalendarDays, startOfDay } from 'date-fns'

const CYCLE_START = new Date('2025-01-06') // Must be a Monday

/**
 * Returns 0 (week 1) or 1 (week 2) in the 2-week cycle for a given date.
 */
export function getWeekCycle(date) {
  const d = startOfDay(date)
  const diff = differenceInCalendarDays(d, CYCLE_START)
  if (diff < 0) return null
  return Math.floor(diff / 7) % 2
}

/**
 * Returns true if the given batchId is scheduled on the given date.
 */
export function isBatchDay(batchId, date) {
  const d = new Date(date)
  const dow = d.getDay()
  if (dow === 0 || dow === 6) return false
  const cycle = getWeekCycle(d)
  if (cycle === null) return false
  const mtwDays = [1, 2, 3]
  const thfDays  = [4, 5]
  if (batchId === 1) return cycle === 0 ? mtwDays.includes(dow) : thfDays.includes(dow)
  if (batchId === 2) return cycle === 0 ? thfDays.includes(dow) : mtwDays.includes(dow)
  return false
}

/**
 * Returns days array for a calendar month grid (with leading nulls).
 */
export function calendarDays(year, month) {
  const result = []
  const firstDow = new Date(year, month, 1).getDay()
  for (let i = 0; i < firstDow; i++) result.push(null)
  const lastDate = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= lastDate; d++) result.push(new Date(year, month, d))
  return result
}

export function formatDate(date) {
  return format(date instanceof Date ? date : parseISO(date), 'yyyy-MM-dd')
}

export function displayDate(dateStr) {
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

export function isWeekend(date) {
  const dow = new Date(date).getDay()
  return dow === 0 || dow === 6
}

export function isPast(date) {
  return startOfDay(new Date(date)) < startOfDay(new Date())
}

export function isToday(date) {
  return formatDate(new Date(date)) === formatDate(new Date())
}

export function isTomorrow(date) {
  const tmr = new Date()
  tmr.setDate(tmr.getDate() + 1)
  return formatDate(new Date(date)) === formatDate(tmr)
}

/**
 * Compute fairness score for a user (0–100).
 */
export function computeFairness(user) {
  return Math.max(0, 100 - user.lateCancels * 10 - user.absences * 5 - user.bufferUsed * 2)
}

export const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const DAY_SHORT    = ['Su','Mo','Tu','We','Th','Fr','Sa']
