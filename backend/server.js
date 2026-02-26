require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')
const cron     = require('node-cron')

const authRoutes    = require('./routes/auth')
const bookingRoutes = require('./routes/bookings')
const { wRouter: waitlistRoutes, iRouter: inventoryRoutes, aRouter: adminRoutes } = require('./routes/other')
const { runAttendanceCron, runBufferAllocationCron } = require('./services/cronJobs')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logger (dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next() })
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/bookings',  bookingRoutes)
app.use('/api/waitlist',  waitlistRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/admin',     adminRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  const status  = err.status || 500
  const message = err.message || 'Internal server error'
  res.status(status).json({ message })
})

// ── Cron Jobs ────────────────────────────────────────────────────────────────
// Mark no-shows as ABSENT at 10:05 AM every weekday
cron.schedule('5 10 * * 1-5', runAttendanceCron)

// Run buffer allocation at 9:00 AM every weekday
cron.schedule('0 9 * * 1-5', runBufferAllocationCron)

// ── DB + Start ───────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected')
    app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('✗ MongoDB connection failed:', err.message)
    process.exit(1)
  })
