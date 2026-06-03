const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// GET all parties
router.get('/', async (req, res) => {
  try {
    const parties = await prisma.party.findMany({
      include: {
        governments: { where: { isActive: true }, include: { region: true } },
        _count: { select: { manifestos: true } }
      }
    })
    res.json(parties)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET party scorecard
router.get('/:id/scorecard', async (req, res) => {
  try {
    const party = await prisma.party.findUnique({ where: { id: req.params.id } })
    if (!party) return res.status(404).json({ error: 'Party not found' })

    const governments = await prisma.government.findMany({ where: { partyId: req.params.id } })
    const govIds = governments.map(g => g.id)

    const [total, byStatus, byCategory] = await Promise.all([
      prisma.promise.count({ where: { governmentId: { in: govIds } } }),
      prisma.promise.groupBy({ by: ['status'], where: { governmentId: { in: govIds } }, _count: true }),
      prisma.promise.groupBy({ by: ['category'], where: { governmentId: { in: govIds } }, _count: true })
    ])

    const delivered = byStatus.find(s => s.status === 'DELIVERED')?._count || 0
    const score = total > 0 ? Math.round((delivered / total) * 100) : 0

    res.json({ party, total, score, byStatus, byCategory })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router