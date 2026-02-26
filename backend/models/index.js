const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

// ── User ─────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:         { type: String,  required: true, trim: true },
  email:        { type: String,  required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String,  required: true, select: false },
  role:         { type: String,  enum: ['USER','ADMIN'], default: 'USER' },
  status:       { type: String,  enum: ['ACTIVE','BLOCKED'], default: 'ACTIVE' },
  batchId:      { type: Number,  enum: [1, 2], default: null },
  squadNo:      { type: Number,  min: 1, max: 5, default: null },
  bufferUsed:   { type: Number,  default: 0 },
  lateCancels:  { type: Number,  default: 0 },
  absences:     { type: Number,  default: 0 },
  fairnessScore:{ type: Number,  default: 100 },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}
userSchema.methods.computeFairness = function () {
  return Math.max(0, 100 - this.lateCancels * 10 - this.absences * 5 - this.bufferUsed * 2)
}

// ── Booking ───────────────────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:        { type: String,  required: true }, // 'YYYY-MM-DD'
  seatType:    { type: String,  enum: ['GUARANTEED','BUFFER'], required: true },
  status:      { type: String,  enum: ['BOOKED','CANCELLED','LATE_CANCEL','CHECKED_IN','ABSENT'], default: 'BOOKED' },
  requestTime: { type: Date,    default: Date.now },
  checkedInAt: { type: Date,    default: null },
}, { timestamps: true })

bookingSchema.index({ userId: 1, date: 1 })
bookingSchema.index({ date: 1, status: 1 })

// ── DailySeatInventory ────────────────────────────────────────────────────────
const inventorySchema = new mongoose.Schema({
  date:             { type: String, required: true, unique: true },
  guaranteedTotal:  { type: Number, default: 10 },
  guaranteedBooked: { type: Number, default: 0  },
  bufferTotal:      { type: Number, default: 10 },
  bufferBooked:     { type: Number, default: 0  },
}, { timestamps: true })

// ── BufferWaitlist ────────────────────────────────────────────────────────────
const waitlistSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:          { type: String, required: true },
  requestTime:   { type: Date,   default: Date.now },
  priorityScore: { type: Number, default: 100 },
  status:        { type: String, enum: ['PENDING','ALLOCATED','REJECTED'], default: 'PENDING' },
}, { timestamps: true })

waitlistSchema.index({ date: 1, status: 1 })
waitlistSchema.index({ userId: 1 })

// ── Holiday ───────────────────────────────────────────────────────────────────
const holidaySchema = new mongoose.Schema({
  date:        { type: String, required: true, unique: true },
  description: { type: String, required: true },
}, { timestamps: true })

// ── CycleConfig ───────────────────────────────────────────────────────────────
const cycleConfigSchema = new mongoose.Schema({
  cycleStart:      { type: String, default: '2025-01-06' },
  timezone:        { type: String, default: 'Asia/Kolkata' },
  guaranteedSeats: { type: Number, default: 10 },
  bufferSeats:     { type: Number, default: 10 },
  checkInDeadline: { type: String, default: '10:00' },
  bookingClose:    { type: String, default: '09:00' },
  bufferOpen:      { type: String, default: '15:00' },
}, { timestamps: true })

module.exports = {
  User:          mongoose.model('User',          userSchema),
  Booking:       mongoose.model('Booking',       bookingSchema),
  Inventory:     mongoose.model('Inventory',     inventorySchema),
  WaitlistEntry: mongoose.model('WaitlistEntry', waitlistSchema),
  Holiday:       mongoose.model('Holiday',       holidaySchema),
  CycleConfig:   mongoose.model('CycleConfig',   cycleConfigSchema),
}
