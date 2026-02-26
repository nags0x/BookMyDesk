// ── waitlist.js ──────────────────────────────────────────────────────────────
const express = require('express')
const { authenticate } = require('../middleware/auth')
const { WaitlistEntry } = require('../models')
const { formatDate } = require('../services/scheduleService')

const wRouter = express.Router()
wRouter.use(authenticate)

wRouter.get('/my', async (req, res, next) => {
  try {
    const entries = await WaitlistEntry.find({ userId: req.user._id }).sort({ date: -1 })
    res.json(entries)
  } catch (err) { next(err) }
})

wRouter.post('/', async (req, res, next) => {
  try {
    const { date } = req.body
    if (!date) return res.status(400).json({ message: 'Date is required.' })

    const existing = await WaitlistEntry.findOne({ userId: req.user._id, date, status: 'PENDING' })
    if (existing) return res.status(409).json({ message: 'Already on waitlist for this date.' })

    const entry = await WaitlistEntry.create({
      userId: req.user._id,
      date,
      priorityScore: req.user.fairnessScore ?? 100,
      status: 'PENDING',
    })
    res.status(201).json(entry)
  } catch (err) { next(err) }
})

wRouter.delete('/:id', async (req, res, next) => {
  try {
    const entry = await WaitlistEntry.findOne({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ message: 'Waitlist entry not found.' })
    if (entry.status !== 'PENDING') return res.status(400).json({ message: 'Can only remove pending entries.' })
    await entry.deleteOne()
    res.json({ message: 'Removed from waitlist.' })
  } catch (err) { next(err) }
})

wRouter.patch('/:id/respond', async (req, res, next) => {
  const { action } = req.body // 'ACCEPT' or 'REJECT'
  const entry = await WaitlistEntry.findOne({ _id: req.params.id, userId: req.user._id })

  if (!entry) return res.status(404).json({ message: 'Offer not found.' })
  if (entry.status !== 'OFFERED') return res.status(400).json({ message: 'No active offer for this entry.' })

  if (action === 'REJECT') {
    entry.status = 'REJECTED'
    await entry.save()

    // Trigger next person in line
    const nextInLine = await WaitlistEntry.findOne({ date: entry.date, status: 'PENDING' }).sort({ priorityScore: -1, requestTime: 1 })
    if (nextInLine) {
      nextInLine.status = 'OFFERED'
      await nextInLine.save()
    }
    return res.json({ message: 'Offer declined.' })
  }

  if (action === 'ACCEPT') {
    const { Booking, Inventory, User } = require('../models')
    const inv = await Inventory.findOne({ date: entry.date })

    if (!inv || inv.bufferBooked >= inv.bufferTotal) {
      return res.status(400).json({ message: 'Sorry, this seat is no longer available.' })
    }

    await Booking.create({ userId: req.user._id, date: entry.date, seatType: 'BUFFER', status: 'BOOKED' })
    await User.findByIdAndUpdate(req.user._id, { $inc: { bufferUsed: 1 } })

    inv.bufferBooked += 1
    await inv.save()

    entry.status = 'ALLOCATED'
    await entry.save()

    return res.json({ message: 'Seat accepted and booked!' })
  }

  res.status(400).json({ message: 'Invalid action.' })
})

// ── inventory.js ─────────────────────────────────────────────────────────────
const iRouter = express.Router()
iRouter.use(authenticate)

iRouter.get('/', async (req, res, next) => {
  try {
    const date = req.query.date || formatDate(new Date())
    let inv = await require('../models').Inventory.findOne({ date })
    if (!inv) inv = { date, guaranteedTotal: 10, guaranteedBooked: 0, bufferTotal: 10, bufferBooked: 0 }
    res.json(inv)
  } catch (err) { next(err) }
})

// ── admin.js ──────────────────────────────────────────────────────────────────
const aRouter = express.Router()
const { authenticate: auth2, requireAdmin } = require('../middleware/auth')
const { User, Booking, Holiday, CycleConfig } = require('../models')

aRouter.use(auth2, requireAdmin)

// Stats
aRouter.get('/stats', async (req, res, next) => {
  try {
    const members = await User.countDocuments({ role: 'USER' })
    const totalBookings = await Booking.countDocuments()
    const checkedIn = await Booking.countDocuments({ status: 'CHECKED_IN' })
    const absences = await Booking.countDocuments({ status: 'ABSENT' })
    const cancellations = await Booking.countDocuments({ status: { $in: ['CANCELLED', 'LATE_CANCEL'] } })
    const utilization = totalBookings ? Math.round((checkedIn / totalBookings) * 100) : 0

    const b1Members = await User.find({ role: 'USER', batchId: 1 }).select('_id')
    const b1Ids = b1Members.map(u => u._id)
    const b1Books = await Booking.countDocuments({ userId: { $in: b1Ids } })
    const b1Absent = await Booking.countDocuments({ userId: { $in: b1Ids }, status: 'ABSENT' })
    const batch1Util = b1Books ? Math.round(((b1Books - b1Absent) / b1Books) * 100) : 0

    const b2Members = await User.find({ role: 'USER', batchId: 2 }).select('_id')
    const b2Ids = b2Members.map(u => u._id)
    const b2Books = await Booking.countDocuments({ userId: { $in: b2Ids } })
    const b2Absent = await Booking.countDocuments({ userId: { $in: b2Ids }, status: 'ABSENT' })
    const batch2Util = b2Books ? Math.round(((b2Books - b2Absent) / b2Books) * 100) : 0

    res.json({ totalMembers: members, totalBookings, checkedIn, absences, cancellations, utilization, batch1Util, batch2Util })
  } catch (err) { next(err) }
})

// Users
aRouter.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json(users)
  } catch (err) { next(err) }
})

aRouter.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['ACTIVE', 'BLOCKED'].includes(status)) return res.status(400).json({ message: 'Invalid status.' })
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (err) { next(err) }
})

// Bookings
aRouter.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('userId', 'name email').sort({ date: -1 })
    const enriched = bookings.map(b => ({
      _id: b._id, date: b.date, seatType: b.seatType, status: b.status,
      requestTime: b.requestTime,
      userName: b.userId?.name,
      userEmail: b.userId?.email,
    }))
    res.json(enriched)
  } catch (err) { next(err) }
})

aRouter.patch('/bookings/:id/override', async (req, res, next) => {
  try {
    const { status } = req.body
    const valid = ['BOOKED', 'CHECKED_IN', 'CANCELLED', 'ABSENT', 'LATE_CANCEL']
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' })
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    res.json(booking)
  } catch (err) { next(err) }
})

// Config
aRouter.get('/config', async (req, res, next) => {
  try {
    let cfg = await CycleConfig.findOne()
    if (!cfg) cfg = await CycleConfig.create({})
    const holidays = await Holiday.find().sort({ date: 1 })
    res.json({ ...cfg.toObject(), holidays })
  } catch (err) { next(err) }
})

aRouter.put('/config', async (req, res, next) => {
  try {
    const allowed = ['guaranteedSeats', 'bufferSeats', 'cycleStart', 'timezone', 'checkInDeadline', 'bookingClose', 'bufferOpen']
    const update = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k] })
    const cfg = await CycleConfig.findOneAndUpdate({}, update, { new: true, upsert: true })
    res.json(cfg)
  } catch (err) { next(err) }
})

// Holidays
aRouter.post('/holidays', async (req, res, next) => {
  try {
    const { date, desc } = req.body
    if (!date || !desc) return res.status(400).json({ message: 'Date and description are required.' })
    const holiday = await Holiday.create({ date, description: desc })
    res.status(201).json(holiday)
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Holiday already exists for this date.' })
    next(err)
  }
})

aRouter.delete('/holidays/:id', async (req, res, next) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id)
    res.json({ message: 'Holiday deleted.' })
  } catch (err) { next(err) }
})

module.exports = { wRouter, iRouter, aRouter }
