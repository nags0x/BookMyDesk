const CYCLE_START = new Date('2025-01-06T00:00:00')

function formatDate(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getWeekCycle(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = Math.floor((d - CYCLE_START) / 86400000)
  if (diff < 0) return null
  return Math.floor(diff / 7) % 2 // 0 = week1, 1 = week2
}

function isBatchDay(batchId, date) {
  const d   = new Date(date)
  const dow = d.getDay()
  if (dow === 0 || dow === 6) return false
  const cycle = getWeekCycle(d)
  if (cycle === null) return false
  const mtwDays = [1, 2, 3]
  const thfDays = [4, 5]
  if (batchId === 1) return cycle === 0 ? mtwDays.includes(dow) : thfDays.includes(dow)
  if (batchId === 2) return cycle === 0 ? thfDays.includes(dow) : mtwDays.includes(dow)
  return false
}

function getNextWorkingDay(fromDate) {
  const d = new Date(fromDate)
  d.setDate(d.getDate() + 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d
}

module.exports = { formatDate, getWeekCycle, isBatchDay, getNextWorkingDay }
