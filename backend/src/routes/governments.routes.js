const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

router.get('/', async (req, res) => {
  try {
    const { active } = req.query
    const where = {}
    if (active === 'true') where.isActive = true

    const governments = await prisma.government.findMany({
      where,
      include: {
        party: true,
        region: true,
        _count: { select: { promises: true } }
      }
    })
    res.json(governments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id/scorecard', async (req, res) => {
  try {
    const government = await prisma.government.findUnique({
      where: { id: req.params.id },
      include: { party: true, region: true }
    })
    if (!government) return res.status(404).json({ error: 'Government not found' })

    const [total, byStatus, byCategory] = await Promise.all([
      prisma.promise.count({ where: { governmentId: req.params.id } }),
      prisma.promise.groupBy({ by: ['status'], where: { governmentId: req.params.id }, _count: true }),
      prisma.promise.groupBy({ by: ['category'], where: { governmentId: req.params.id }, _count: true })
    ])

    const delivered = byStatus.find(s => s.status === 'DELIVERED')?._count || 0
    const score = total > 0 ? Math.round((delivered / total) * 100) : 0

    res.json({ government, total, score, byStatus, byCategory })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router