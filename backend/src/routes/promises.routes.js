const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// GET all promises with filters
router.get('/', async (req, res) => {
  try {
    const { status, category, regionId, governmentId, search, page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (status) where.status = status
    if (category) where.category = category
    if (regionId) where.regionId = regionId
    if (governmentId) where.governmentId = governmentId
    if (search) {
      where.text = { contains: search, mode: 'insensitive' }
    }

    const [promises, total] = await Promise.all([
      prisma.promise.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          region: { select: { name: true, code: true, level: true } },
          government: { select: { name: true } },
          manifesto: { select: { title: true, electionYear: true, party: { select: { name: true, shortName: true, colour: true } } } },
          _count: { select: { evidence: true } }
        }
      }),
      prisma.promise.count({ where })
    ])

    res.json({
      promises,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET promise stats
router.get('/stats', async (req, res) => {
  try {
    const [total, byStatus, byCategory] = await Promise.all([
      prisma.promise.count(),
      prisma.promise.groupBy({ by: ['status'], _count: true }),
      prisma.promise.groupBy({ by: ['category'], _count: true })
    ])

    res.json({ total, byStatus, byCategory })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single promise
router.get('/:id', async (req, res) => {
  try {
    const promise = await prisma.promise.findUnique({
      where: { id: req.params.id },
      include: {
        region: true,
        government: { include: { party: true } },
        manifesto: { include: { party: true } },
        evidence: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { changedAt: 'desc' } }
      }
    })
    if (!promise) return res.status(404).json({ error: 'Promise not found' })
    
    // Increment view count
    await prisma.promise.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    })

    res.json(promise)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH update promise status (admin)
router.patch('/:id', async (req, res) => {
  try {
    const { status, summary, confidenceScore } = req.body
    const existing = await prisma.promise.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Promise not found' })

    const updated = await prisma.promise.update({
      where: { id: req.params.id },
      data: { status, summary, confidenceScore }
    })

    // Save status history if status changed
    if (status && status !== existing.status) {
      await prisma.statusHistory.create({
        data: {
          promiseId: req.params.id,
          oldStatus: existing.status,
          newStatus: status,
          reason: req.body.reason || 'Manual update'
        }
      })
    }

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Export CSV
router.get('/export/csv', async (req, res) => {
  try {
    const promises = await prisma.promise.findMany({
      include: {
        region: { select: { name: true, code: true } },
        manifesto: { include: { party: { select: { name: true, shortName: true } } } },
        government: { select: { name: true } }
      }
    })

    const headers = ['id', 'text', 'status', 'category', 'party', 'region', 'government', 'targetGroup', 'statedDeadline', 'confidenceScore', 'createdAt']
    const rows = promises.map(p => [
      p.id,
      `"${p.text.replace(/"/g, '""')}"`,
      p.status,
      p.category,
      p.manifesto?.party?.shortName || '',
      p.region?.name || '',
      p.government?.name || '',
      p.targetGroup || '',
      p.statedDeadline || '',
      p.confidenceScore || '',
      p.createdAt
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=manifesto-promises.csv')
    res.send(csv)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Export JSON
router.get('/export/json', async (req, res) => {
  try {
    const promises = await prisma.promise.findMany({
      include: {
        region: { select: { name: true, code: true } },
        manifesto: { include: { party: { select: { name: true, shortName: true } } } },
        government: { select: { name: true } }
      }
    })
    res.setHeader('Content-Disposition', 'attachment; filename=manifesto-promises.json')
    res.json(promises)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router