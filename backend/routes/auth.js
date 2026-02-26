const express = require('express')
const jwt     = require('jsonwebtoken')
const { z }   = require('zod')
const { User } = require('../models')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const schema = z.object({
      name:     z.string().min(2),
      email:    z.string().email(),
      password: z.string().min(4),
      role:     z.enum(['USER','ADMIN']),
      batchId:  z.number().int().min(1).max(2).optional(),
      squadNo:  z.number().int().min(1).max(5).optional(),
    })
    const data = schema.parse(req.body)

    if (await User.findOne({ email: data.email })) {
      return res.status(409).json({ message: 'Email already registered.' })
    }
    if (data.role === 'USER' && (!data.batchId || !data.squadNo)) {
      return res.status(400).json({ message: 'Batch and squad are required for members.' })
    }

    const user  = await User.create(data)
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, status: user.status,
        batchId: user.batchId, squadNo: user.squadNo,
        bufferUsed: user.bufferUsed, lateCancels: user.lateCancels, absences: user.absences,
        fairnessScore: user.fairnessScore,
      },
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ message: err.errors[0].message })
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Your account has been blocked. Contact your admin.' })
    }

    const token = signToken(user._id)
    res.json({
      token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, status: user.status,
        batchId: user.batchId, squadNo: user.squadNo,
        bufferUsed: user.bufferUsed, lateCancels: user.lateCancels, absences: user.absences,
        fairnessScore: user.fairnessScore,
      },
    })
  } catch (err) { next(err) }
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const u = req.user
  res.json({
    _id: u._id, name: u.name, email: u.email,
    role: u.role, status: u.status,
    batchId: u.batchId, squadNo: u.squadNo,
    bufferUsed: u.bufferUsed, lateCancels: u.lateCancels, absences: u.absences,
    fairnessScore: u.computeFairness(),
  })
})

module.exports = router
