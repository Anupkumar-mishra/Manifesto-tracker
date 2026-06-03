import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import StatusBadge from '../components/common/StatusBadge'
import PromiseCard from '../components/promises/PromiseCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_COLORS_MAP = {
  DELIVERED: '#22c55e',
  IN_PROGRESS: '#3b82f6',
  STALLED: '#f97316',
  BROKEN: '#ef4444',
  NOT_STARTED: '#9ca3af',
}

export default function StateDetail() {
  const { code } = useParams()
  const [regionData, setRegionData] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:3001/api/regions/${code}/stats`)
      .then(res => res.json())
      .then(data => {
        setRegionData(data.region)
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [code])

  const { data: promisesResponse, isLoading: promisesLoading } = useQuery({
    queryKey: ['state-promises', code],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3001/api/regions/${code}/promises`)
      return res.json()
    }
  })

  // Extract the promises array from the response object
  const promises = Array.isArray(promisesResponse)
    ? promisesResponse
    : promisesResponse?.promises ?? []

  const government = promisesResponse?.government || null

  const pieData = stats?.byStatus?.map(s => ({
    name: s.status,
    value: s._count,
    color: STATUS_COLORS_MAP[s.status]
  })) || []

  if (loading) return <LoadingSpinner message="Loading state data..." />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/map" className="text-blue-600 text-sm hover:underline mb-6 block">
        ← Back to Map
      </Link>

      {/* Header */}
      <div className="bg-blue-900 text-white rounded-2xl p-8 mb-6">
        <h1 className="text-3xl font-bold mb-2">
          📍 {regionData?.name || code}
        </h1>
        <p className="text-blue-300">State-level promise tracking</p>

        {/* Show ruling party */}
        {government && (
          <div className="mt-2 inline-block bg-blue-800 rounded-lg px-3 py-1 text-sm text-blue-200">
            🏛️ Ruling Party: <span className="font-bold text-white">{government.party?.shortName || government.name}</span>
          </div>
        )}

        {stats && (
          <div className="mt-4 flex gap-6">
            <div>
              <div className="text-3xl font-bold">{stats.score}%</div>
              <div className="text-blue-300 text-sm">Delivery Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-blue-300 text-sm">Total Promises</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie chart */}
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

        {/* Status counts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Promise Status Count</h3>
          {stats?.byStatus?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {stats.byStatus.map(s => (
                <div key={s.status} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <StatusBadge status={s.status} size="sm" />
                  <span className="font-bold text-gray-800">{s._count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Promises list */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          All Promises ({promises.length})
        </h2>
        {promisesLoading ? (
          <LoadingSpinner />
        ) : promises.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p>No promises found for this state yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promises.map(promise => (
              <PromiseCard key={promise.id} promise={promise} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}