const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// Simple admin password check middleware
const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password']
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [promises, parties, governments, regions] = await Promise.all([
      prisma.promise.count(),
      prisma.party.count(),
      prisma.government.count(),
      prisma.region.count()
    ])
    res.json({ promises, parties, governments, regions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/promises', adminAuth, async (req, res) => {
  try {
    const promise = await prisma.promise.create({ data: req.body })
    res.json(promise)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
