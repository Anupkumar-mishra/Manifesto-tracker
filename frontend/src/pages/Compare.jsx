import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatusBadge from '../components/common/StatusBadge'
import { CATEGORY_OPTIONS } from '../utils/constants'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const LEVELS = [
  { value: 'NATIONAL', label: '🏛️ National vs National' },
  { value: 'STATE', label: '🗺️ State vs State' },
]

const STATUS_COLORS = {
  DELIVERED: '#22c55e',
  IN_PROGRESS: '#3b82f6',
  STALLED: '#f97316',
  BROKEN: '#ef4444',
  NOT_STARTED: '#9ca3af',
}

export default function Compare() {
  const [level, setLevel] = useState('NATIONAL')
  const [governments, setGovernments] = useState([])
  const [govtA, setGovtA] = useState('')
  const [govtB, setGovtB] = useState('')
  const [scorecardA, setScorecardA] = useState(null)
  const [scorecardB, setScorecardB] = useState(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)

  // Load governments filtered by level
  useEffect(() => {
    setGovtA('')
    setGovtB('')
    setScorecardA(null)
    setScorecardB(null)

    fetch('http://localhost:3001/api/governments')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(g => g.region?.level === level)
        setGovernments(filtered)
      })
      .catch(err => console.error(err))
  }, [level])

  const fetchScorecard = async (govtId, setFn, setLoading) => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/governments/${govtId}/scorecard`)
      const data = await res.json()
      setFn(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (govtA) fetchScorecard(govtA, setScorecardA, setLoadingA)
    else setScorecardA(null)
  }, [govtA])

  useEffect(() => {
    if (govtB) fetchScorecard(govtB, setScorecardB, setLoadingB)
    else setScorecardB(null)
  }, [govtB])

  // Category comparison data
  const categoryData = () => {
    if (!scorecardA || !scorecardB) return []
    return CATEGORY_OPTIONS
      .filter(c => c.value !== '')
      .map(cat => {
        const aCount = scorecardA.byCategory?.find(c => c.category === cat.value)?._count || 0
        const bCount = scorecardB.byCategory?.find(c => c.category === cat.value)?._count || 0
        if (aCount === 0 && bCount === 0) return null
        return {
          name: cat.label.split(' ')[1] || cat.value,
          [scorecardA.government?.name?.split('—')[0]?.trim() || 'A']: aCount,
          [scorecardB.government?.name?.split('—')[0]?.trim() || 'B']: bCount,
        }
      })
      .filter(Boolean)
  }

  const ScoreBlock = ({ scorecard, loading }) => {
    if (loading) return <LoadingSpinner message="Loading..." />
    if (!scorecard) return null

    const { government, total, score, byStatus } = scorecard
    const delivered = byStatus?.find(s => s.status === 'DELIVERED')?._count || 0
    const broken = byStatus?.find(s => s.status === 'BROKEN')?._count || 0
    const inProgress = byStatus?.find(s => s.status === 'IN_PROGRESS')?._count || 0
    const color = government?.party?.colour || '#1e40af'

    const getScoreColor = (s) => {
      if (s >= 50) return 'text-green-600'
      if (s >= 25) return 'text-orange-500'
      return 'text-red-600'
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 text-white" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-xl">
              {government?.party?.shortName?.[0]}
            </div>
            <div>
              <div className="font-bold text-lg">{government?.name}</div>
              <div className="opacity-80 text-sm">
                {government?.party?.shortName} · {government?.region?.name}
              </div>
              <div className="opacity-60 text-xs mt-0.5">
                {new Date(government?.termStart).getFullYear()}
                {government?.termEnd ? ` – ${new Date(government?.termEnd).getFullYear()}` : ' – Present'}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <div className="text-sm opacity-80">{score}% delivery rate</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {[
            { label: 'Total Promises', value: total, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Delivered', value: delivered, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'In Progress', value: inProgress, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Broken', value: broken, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="px-4 pb-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Status Breakdown</div>
          {byStatus?.map(s => (
            <div key={s.status} className="flex items-center justify-between mb-2">
              <StatusBadge status={s.status} size="sm" />
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${total > 0 ? (s._count / total) * 100 : 0}%`,
                      backgroundColor: STATUS_COLORS[s.status]
                    }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-gray-600 w-6 text-right">{s._count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const winner = () => {
    if (!scorecardA || !scorecardB) return null
    if (scorecardA.score > scorecardB.score) return scorecardA.government?.name
    if (scorecardB.score > scorecardA.score) return scorecardB.government?.name
    return 'tie'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">⚖️ Compare Governments</h1>
        <p className="text-gray-500 mt-1">
          Compare ruling governments — who delivered more during their term
        </p>
      </div>

      {/* Level selector */}
      <div className="flex gap-3 mb-6">
        {LEVELS.map(l => (
          <button
            key={l.value}
            onClick={() => setLevel(l.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              level === l.value
                ? 'bg-blue-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Context banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-bold">📌 Fair comparison:</span> Only ruling governments are shown.
          Delivery scores reflect promises made during their election manifesto vs what was actually implemented during their term.
        </p>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: 'GOVERNMENT A', value: govtA, setFn: setGovtA },
          { label: 'GOVERNMENT B', value: govtB, setFn: setGovtB },
        ].map(({ label, value, setFn }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">{label}</label>
            <select
              value={value}
              onChange={e => setFn(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Choose a government...</option>
              {governments.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.party?.shortName})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Comparison results */}
      {(scorecardA || scorecardB || loadingA || loadingB) && (
        <>
          {/* Score cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ScoreBlock scorecard={scorecardA} loading={loadingA} />
            <ScoreBlock scorecard={scorecardB} loading={loadingB} />
          </div>

          {/* Winner banner */}
          {scorecardA && scorecardB && (
            <div className={`rounded-xl p-4 mb-6 text-center font-bold ${
              winner() === 'tie'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {winner() === 'tie'
                ? `🤝 Both governments tied at ${scorecardA.score}% delivery rate!`
                : `🏆 ${winner()} leads with better promise delivery rate!`
              }
            </div>
          )}

          {/* Category comparison chart */}
          {scorecardA && scorecardB && categoryData().length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">📊 Category Comparison</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={scorecardA.government?.name?.split('—')[0]?.trim() || 'A'}
                    fill={scorecardA.government?.party?.colour || '#1e40af'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={scorecardB.government?.name?.split('—')[0]?.trim() || 'B'}
                    fill={scorecardB.government?.party?.colour || '#ef4444'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Head to head table */}
          {scorecardA && scorecardB && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">📋 Head to Head</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Metric</th>
                    <th className="text-center py-2 px-3 font-medium" style={{ color: scorecardA.government?.party?.colour }}>
                      {scorecardA.government?.party?.shortName}
                    </th>
                    <th className="text-center py-2 px-3 font-medium" style={{ color: scorecardB.government?.party?.colour }}>
                      {scorecardB.government?.party?.shortName}
                    </th>
                    <th className="text-center py-2 px-3 text-gray-500 font-medium">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
  const aDelivered = scorecardA.byStatus?.find(s => s.status === 'DELIVERED')?._count ?? 0
  const bDelivered = scorecardB.byStatus?.find(s => s.status === 'DELIVERED')?._count ?? 0
  const aBroken = scorecardA.byStatus?.find(s => s.status === 'BROKEN')?._count ?? 0
  const bBroken = scorecardB.byStatus?.find(s => s.status === 'BROKEN')?._count ?? 0

  return [
    {
      metric: 'Delivery Rate',
      a: `${scorecardA.score}%`,
      b: `${scorecardB.score}%`,
      winner: scorecardA.score > scorecardB.score ? 'A' : scorecardB.score > scorecardA.score ? 'B' : 'Tie'
    },
    {
      metric: 'Total Promises',
      a: scorecardA.total,
      b: scorecardB.total,
      winner: scorecardA.total > scorecardB.total ? 'A' : scorecardB.total > scorecardA.total ? 'B' : 'Tie'
    },
    {
      metric: 'Promises Delivered',
      a: aDelivered,
      b: bDelivered,
      winner: aDelivered > bDelivered ? 'A' : bDelivered > aDelivered ? 'B' : 'Tie'
    },
    {
      metric: 'Promises Broken',
      a: aBroken,
      b: bBroken,
      winner: aBroken < bBroken ? 'A' : bBroken < aBroken ? 'B' : 'Tie'
    },
  ]
})().map(row => (
                    <tr key={row.metric} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-700 font-medium">{row.metric}</td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: scorecardA.government?.party?.colour }}>
                        {row.a}
                      </td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: scorecardB.government?.party?.colour }}>
                        {row.b}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {row.winner === 'A' ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: scorecardA.government?.party?.colour }}>
                            {scorecardA.government?.party?.shortName}
                          </span>
                        ) : row.winner === 'B' ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: scorecardB.government?.party?.colour }}>
                            {scorecardB.government?.party?.shortName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Tie</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!scorecardA && !scorecardB && !loadingA && !loadingB && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">⚖️</div>
          <p className="text-lg font-medium">Select two governments above to compare</p>
          <p className="text-sm mt-2">
            {level === 'NATIONAL'
              ? 'Compare Modi 1.0 vs Modi 2.0, or BJP vs UPA governments'
              : 'Compare any two state governments side by side'
            }
          </p>
        </div>
      )}
    </div>
  )
}