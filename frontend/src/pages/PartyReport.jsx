import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPromises } from '../services/promiseService'
import StatusBadge from '../components/common/StatusBadge'
import PromiseCard from '../components/promises/PromiseCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CATEGORY_OPTIONS } from '../utils/constants'

const STATUS_COLORS_MAP = {
  DELIVERED: '#22c55e',
  IN_PROGRESS: '#3b82f6',
  STALLED: '#f97316',
  BROKEN: '#ef4444',
  NOT_STARTED: '#9ca3af',
}

export default function PartyReport() {
  const { id } = useParams()
  const [scorecard, setScorecard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:3001/api/parties/${id}/scorecard`)
      .then(res => res.json())
      .then(data => {
        setScorecard(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const { data: promisesData } = useQuery({
    queryKey: ['party-promises', id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/promises?limit=6`)
      return res.json()
    }
  })

  if (loading) return <LoadingSpinner message="Loading party scorecard..." />
  if (!scorecard) return (
    <div className="text-center py-20 text-red-500">
      ❌ Party not found
      <Link to="/" className="block mt-4 text-blue-600 underline">← Back to Home</Link>
    </div>
  )

  const { party, total, score, byStatus, byCategory } = scorecard

  const pieData = byStatus?.map(s => ({
    name: s.status,
    value: s._count,
    color: STATUS_COLORS_MAP[s.status]
  })) || []

  const barData = byCategory?.slice(0, 8).map(c => ({
    name: CATEGORY_OPTIONS.find(o => o.value === c.category)?.label?.split(' ')[1] || c.category,
    count: c._count
  })) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 text-sm hover:underline mb-6 block">
        ← Back to Home
      </Link>

      {/* Party header */}
      <div
        className="text-white rounded-2xl p-8 mb-6"
        style={{ backgroundColor: party?.colour || '#1e40af' }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
            {party?.shortName?.[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{party?.name}</h1>
            <p className="opacity-80">{party?.shortName} · Election Manifesto Tracker</p>
          </div>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="text-4xl font-bold">{score}%</div>
            <div className="opacity-80 text-sm">Delivery Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{total}</div>
            <div className="opacity-80 text-sm">Total Promises</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Status Breakdown</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map(d => (
                  <span key={d.name} className="text-xs flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Promises by Category</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill={party?.colour || '#1e40af'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {byStatus?.map(s => (
          <div key={s.status} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <StatusBadge status={s.status} size="sm" />
            <div className="text-2xl font-bold text-gray-800 mt-2">{s._count}</div>
          </div>
        ))}
      </div>

      {/* Recent promises */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Promises</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promisesData?.promises?.map(promise => (
            <PromiseCard key={promise.id} promise={promise} />
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/promises"
            className="inline-block bg-blue-900 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            View All {party?.shortName} Promises →
          </Link>
        </div>
      </div>
    </div>
  )
}