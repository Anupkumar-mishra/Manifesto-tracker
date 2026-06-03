const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// GET all regions
router.get('/', async (req, res) => {
  try {
    const { level, parentId } = req.query
    const where = {}
    if (level) where.level = level
    if (parentId) where.parentId = parentId

    const regions = await prisma.region.findMany({
      where,
      include: { _count: { select: { promises: true } } }
    })
    res.json(regions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET region stats by code
router.get('/:code/stats', async (req, res) => {
  try {
    const region = await prisma.region.findUnique({ where: { code: req.params.code } })
    if (!region) return res.status(404).json({ error: 'Region not found' })

    // Find the active ruling government for this region
    const government = await prisma.government.findFirst({
      where: { regionId: region.id, isActive: true },
      orderBy: { termStart: 'desc' }
    })

    // Only count promises belonging to the ruling government
    const whereClause = {
      regionId: region.id,
      ...(government ? { governmentId: government.id } : {})
    }

    const [total, byStatus] = await Promise.all([
      prisma.promise.count({ where: whereClause }),
      prisma.promise.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      })
    ])

    const delivered = byStatus.find(s => s.status === 'DELIVERED')?._count || 0
    const score = total > 0 ? Math.round((delivered / total) * 100) : 0

    res.json({
      region,
      government: government || null,
      total,
      score,
      byStatus
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET promises for a region (ruling party only)
router.get('/:code/promises', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 50 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const region = await prisma.region.findUnique({ where: { code: req.params.code } })
    if (!region) return res.status(404).json({ error: 'Region not found' })

    // Find the active ruling government for this region
    const government = await prisma.government.findFirst({
      where: { regionId: region.id, isActive: true },
      orderBy: { termStart: 'desc' },
      include: { party: true }
    })

    // Build filter — only this region + ruling government
    const whereClause = {
      regionId: region.id,
      ...(government ? { governmentId: government.id } : {})
    }

    if (status) whereClause.status = status
    if (category) whereClause.category = category

    const [promises, total] = await Promise.all([
      prisma.promise.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit),
        include: {
          manifesto: { include: { party: true } },
          government: { include: { party: true } }
        }
      }),
      prisma.promise.count({ where: whereClause })
    ])

    res.json({
      region,
      government: government || null,
      promises,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router