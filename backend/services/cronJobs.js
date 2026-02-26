const { Booking, WaitlistEntry, Inventory, User } = require('../models')
const { formatDate } = require('./scheduleService')

/**
 * Run at 10:05 AM weekdays.
 * Mark all BOOKED bookings for today that haven't checked in as ABSENT.
 * Release their seats back to the buffer pool.
 */
async function runAttendanceCron() {
  const today = formatDate(new Date())
  console.log(`[CRON] Running attendance check for ${today}`)
  try {
    const noShows = await Booking.find({ date: today, status: 'BOOKED' })

    for (const booking of noShows) {
      booking.status = 'ABSENT'
      await booking.save()
      await User.findByIdAndUpdate(booking.userId, { $inc: { absences: 1 } })
    }

    if (noShows.length > 0) {
      // Add freed guaranteed seats to buffer pool
      const inv = await Inventory.findOne({ date: today })
      if (inv) {
        inv.bufferTotal += noShows.filter(b => b.seatType === 'GUARANTEED').length
        await inv.save()
      }
      console.log(`[CRON] Marked ${noShows.length} bookings as ABSENT for ${today}`)
    }
  } catch (err) {
    console.error('[CRON] Attendance cron failed:', err)
  }
}

/**
 * Run at 9:00 AM weekdays.
 * Allocate buffer seats for today based on fairness score.
 */
async function runBufferAllocationCron() {
  const today = formatDate(new Date())
  console.log(`[CRON] Running buffer allocation for ${today}`)
  try {
    const pending = await WaitlistEntry.find({ date: today, status: 'PENDING' })
      .populate('userId', 'bufferUsed lateCancels absences')
      .sort({ requestTime: 1 })

    if (pending.length === 0) return

    let inv = await Inventory.findOne({ date: today })
    if (!inv) inv = await Inventory.create({ date: today })

    const available = inv.bufferTotal - inv.bufferBooked

    // Sort by fairness: lowest bufferUsed → lowest lateCancels → lowest absences → earliest requestTime
    const sorted = pending.sort((a, b) => {
      if (a.userId.bufferUsed !== b.userId.bufferUsed)   return a.userId.bufferUsed  - b.userId.bufferUsed
      if (a.userId.lateCancels !== b.userId.lateCancels) return a.userId.lateCancels - b.userId.lateCancels
      if (a.userId.absences !== b.userId.absences)       return a.userId.absences    - b.userId.absences
      return a.requestTime - b.requestTime
    })

    let allocated = 0
    for (const entry of sorted) {
      if (allocated >= available) {
        entry.status = 'REJECTED'
        await entry.save()
        continue
      }
      // Check for existing booking
      const exists = await Booking.findOne({ userId: entry.userId._id, date: today, status: { $in: ['BOOKED','CHECKED_IN'] } })
      if (exists) {
        entry.status = 'REJECTED'
        await entry.save()
        continue
      }
      // Allocate
      await Booking.create({ userId: entry.userId._id, date: today, seatType: 'BUFFER', status: 'BOOKED' })
      await User.findByIdAndUpdate(entry.userId._id, { $inc: { bufferUsed: 1 } })
      entry.status = 'ALLOCATED'
      await entry.save()
      allocated++
    }

    inv.bufferBooked += allocated
    await inv.save()
    console.log(`[CRON] Allocated ${allocated}/${pending.length} buffer seats for ${today}`)
  } catch (err) {
    console.error('[CRON] Buffer allocation failed:', err)
  }
}

module.exports = { runAttendanceCron, runBufferAllocationCron }
