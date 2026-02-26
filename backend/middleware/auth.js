const jwt  = require('jsonwebtoken')
const { User } = require('../models')

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' })
    }
    const token   = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id)
    if (!user)                   return res.status(401).json({ message: 'User not found.'     })
    if (user.status === 'BLOCKED') return res.status(403).json({ message: 'Account is blocked.' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required.' })
  }
  next()
}

module.exports = { authenticate, requireAdmin }
