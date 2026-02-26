const express  = require('express')
const mongoose = require('mongoose')
const { authenticate } = require('../middleware/auth')
const { Booking, Inventory, Holiday } = require('../models')
const { isBatchDay, formatDate, getNextWorkingDay } = require('../services/scheduleService')

const router = express.Router()
router.use(authenticate)

// GET /api/bookings/my
router.get('/my', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ date: -1 })
    const enriched = bookings.map(b => ({
      _id: b._id, date: b.date, seatType: b.seatType, status: b.status,
      requestTime: b.requestTime, checkedInAt: b.checkedInAt,
    }))
    res.json(enriched)
  } catch (err) { next(err) }
})

// POST /api/bookings
router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const { date, seatType } = req.body
    const user = req.user

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Invalid date format.' })
    }

    const targetDate = new Date(date + 'T00:00:00')
    const today      = new Date(); today.setHours(0,0,0,0)

    // No past bookings
    if (targetDate < today) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Cannot book a date in the past.' })
    }

    // No weekends
    const dow = targetDate.getDay()
    if (dow === 0 || dow === 6) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Cannot book on weekends.' })
    }

    // Check holidays
    const holiday = await Holiday.findOne({ date })
    if (holiday) {
      await session.abortTransaction()
      return res.status(400).json({ message: `${date} is a holiday: ${holiday.description}` })
    }

    // 14-day advance booking limit for guaranteed
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 14)
    if (seatType === 'GUARANTEED' && targetDate > maxDate) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Guaranteed bookings can only be made up to 14 days in advance.' })
    }

    // Same-day booking closes at 9 AM
    if (targetDate.toDateString() === new Date().toDateString()) {
      const now = new Date()
      if (now.getHours() >= 9) {
        await session.abortTransaction()
        return res.status(400).json({ message: 'Same-day bookings close at 9:00 AM.' })
      }
    }

    // Check scheduled
    const scheduled = isBatchDay(user.batchId, targetDate)
    if (seatType === 'GUARANTEED' && !scheduled) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'You are not scheduled for a guaranteed seat on this day.' })
    }

    // 5-booking cap
    const activeCount = await Booking.countDocuments({ userId: user._id, status: 'BOOKED', date: { $gte: formatDate(today) } })
    if (activeCount >= 5) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'Maximum 5 active bookings allowed.' })
    }

    // No duplicate booking
    const existing = await Booking.findOne({ userId: user._id, date, status: { $in: ['BOOKED','CHECKED_IN'] } })
    if (existing) {
      await session.abortTransaction()
      return res.status(409).json({ message: 'You already have a booking for this date.' })
    }

    // Check inventory
    let inv = await Inventory.findOne({ date }).session(session)
    if (!inv) {
      inv = await Inventory.create([{ date, guaranteedTotal: 10, bufferTotal: 10 }], { session })
      inv = inv[0]
    }

    if (seatType === 'GUARANTEED' && inv.guaranteedBooked >= inv.guaranteedTotal) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'No guaranteed seats available for this date.' })
    }
    if (seatType === 'BUFFER' && inv.bufferBooked >= inv.bufferTotal) {
      await session.abortTransaction()
      return res.status(400).json({ message: 'No buffer seats available for this date.' })
    }

    // Create booking
    const [booking] = await Booking.create([{ userId: user._id, date, seatType, status: 'BOOKED' }], { session })

    // Update inventory
    if (seatType === 'GUARANTEED') inv.guaranteedBooked += 1
    else                           inv.bufferBooked     += 1
    await inv.save({ session })

    await session.commitTransaction()
    res.status(201).json({
      _id: booking._id, date: booking.date, seatType: booking.seatType,
      status: booking.status, requestTime: booking.requestTime,
    })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
})

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id }).session(session)
    if (!booking) { await session.abortTransaction(); return res.status(404).json({ message: 'Booking not found.' }) }
    if (booking.status !== 'BOOKED') { await session.abortTransaction(); return res.status(400).json({ message: 'Only active bookings can be cancelled.' }) }

    // Determine if late cancellation (after 9PM previous day)
    const bookingDate  = new Date(booking.date + 'T00:00:00')
    const prevDay9PM   = new Date(bookingDate)
    prevDay9PM.setDate(prevDay9PM.getDate() - 1)
    prevDay9PM.setHours(21, 0, 0, 0)
    const isLate = new Date() > prevDay9PM

    booking.status = isLate ? 'LATE_CANCEL' : 'CANCELLED'
    await booking.save({ session })

    if (isLate) {
      await require('../models').User.findByIdAndUpdate(req.user._id, { $inc: { lateCancels: 1 } }, { session })
    }

    // Release seat
    const inv = await Inventory.findOne({ date: booking.date }).session(session)
    if (inv) {
      if (booking.seatType === 'GUARANTEED') inv.guaranteedBooked = Math.max(0, inv.guaranteedBooked - 1)
      else                                   inv.bufferBooked     = Math.max(0, inv.bufferBooked     - 1)
      await inv.save({ session })
    }

    await session.commitTransaction()
    res.json({ message: isLate ? 'Late cancellation recorded.' : 'Booking cancelled.', status: booking.status })
  } catch (err) {
    await session.abortTransaction()
    next(err)
  } finally {
    session.endSession()
  }
})

// PATCH /api/bookings/:id/checkin
router.patch('/:id/checkin', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id })
    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    if (booking.status !== 'BOOKED') return res.status(400).json({ message: 'Booking is not in BOOKED status.' })

    const now = new Date()
    if (now.getHours() >= 10 && formatDate(now) === booking.date) {
      return res.status(400).json({ message: 'Check-in window has closed (10:00 AM deadline).' })
    }

    booking.status     = 'CHECKED_IN'
    booking.checkedInAt= now
    await booking.save()
    res.json({ message: 'Checked in successfully!', booking })
  } catch (err) { next(err) }
})

module.exports = router
