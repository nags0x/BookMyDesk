require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const { User, Booking, CycleConfig, Holiday, Inventory } = require('../models')

const USERS = [
  { name:'Arjun Mehta',   email:'arjun@corp.io',  password:'pass123', role:'USER',  batchId:1, squadNo:2, bufferUsed:3, lateCancels:1, absences:0, fairnessScore:84 },
  { name:'Priya Sharma',  email:'priya@corp.io',  password:'pass123', role:'USER',  batchId:2, squadNo:4, bufferUsed:1, lateCancels:0, absences:2, fairnessScore:88 },
  { name:'Ravi Nair',     email:'ravi@corp.io',   password:'pass123', role:'USER',  batchId:1, squadNo:1, bufferUsed:5, lateCancels:2, absences:1, fairnessScore:65 },
  { name:'Sneha Patel',   email:'sneha@corp.io',  password:'pass123', role:'USER',  batchId:2, squadNo:3, status:'BLOCKED', bufferUsed:0, lateCancels:3, absences:4, fairnessScore:50 },
  { name:'Karan Verma',   email:'karan@corp.io',  password:'pass123', role:'USER',  batchId:1, squadNo:5, bufferUsed:2, lateCancels:0, absences:0, fairnessScore:96 },
  { name:'Divya Iyer',    email:'divya@corp.io',  password:'pass123', role:'USER',  batchId:2, squadNo:2, bufferUsed:0, lateCancels:1, absences:1, fairnessScore:85 },
  { name:'Admin User',    email:'admin@corp.io',  password:'admin123', role:'ADMIN' },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  // Clear existing
  await Promise.all([
    User.deleteMany({}), Booking.deleteMany({}),
    CycleConfig.deleteMany({}), Holiday.deleteMany({}), Inventory.deleteMany({}),
  ])
  console.log('Cleared existing data')

  // Create users (password hashing handled by pre-save hook)
  const createdUsers = []
  for (const u of USERS) {
    const user = new User(u)
    await user.save()
    createdUsers.push(user)
  }
  console.log(`Created ${createdUsers.length} users`)

  // Create bookings
  const arjun = createdUsers.find(u => u.email === 'arjun@corp.io')
  const priya  = createdUsers.find(u => u.email === 'priya@corp.io')
  const ravi   = createdUsers.find(u => u.email === 'ravi@corp.io')

  const bookings = [
    { userId: arjun._id, date:'2025-02-03', seatType:'GUARANTEED', status:'CHECKED_IN' },
    { userId: arjun._id, date:'2025-02-05', seatType:'GUARANTEED', status:'BOOKED'     },
    { userId: priya._id, date:'2025-02-06', seatType:'BUFFER',     status:'BOOKED'     },
    { userId: ravi._id,  date:'2025-02-03', seatType:'GUARANTEED', status:'ABSENT'     },
    { userId: arjun._id, date:'2025-01-27', seatType:'GUARANTEED', status:'CHECKED_IN' },
  ]
  await Booking.insertMany(bookings)
  console.log(`Created ${bookings.length} bookings`)

  // Config
  await CycleConfig.create({
    cycleStart: '2025-01-06', timezone: 'Asia/Kolkata',
    guaranteedSeats: 10, bufferSeats: 10,
    checkInDeadline: '10:00', bookingClose: '09:00', bufferOpen: '15:00',
  })
  console.log('Created cycle config')

  // Holidays
  await Holiday.insertMany([
    { date:'2025-01-26', description:'Republic Day' },
    { date:'2025-08-15', description:'Independence Day' },
    { date:'2025-10-02', description:'Gandhi Jayanti' },
  ])
  console.log('Created holidays')

  // Today's inventory
  const today = new Date()
  const pad   = (n) => String(n).padStart(2, '0')
  const dateStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`
  await Inventory.create({ date: dateStr, guaranteedTotal:10, guaranteedBooked:7, bufferTotal:10, bufferBooked:4 })
  console.log('Created today\'s inventory')

  console.log('\n✓ Seed complete!\n')
  console.log('  Member:  arjun@corp.io  / pass123')
  console.log('  Admin:   admin@corp.io  / admin123\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1) })
