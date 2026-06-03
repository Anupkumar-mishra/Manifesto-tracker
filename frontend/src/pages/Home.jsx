import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getStats, getPromises, getParties } from '../services/promiseService'
import StatsTicker from '../components/dashboard/StatsTicker'
import ScoreCard from '../components/dashboard/ScoreCard'
import PromiseCard from '../components/promises/PromiseCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CATEGORY_OPTIONS } from '../utils/constants'

const STATUS_CHART_COLORS = {
  DELIVERED: '#22c55e',
  IN_PROGRESS: '#3b82f6',
  STALLED: '#f97316',
  BROKEN: '#ef4444',
  NOT_STARTED: '#9ca3af',
}

export default function Home() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats })
  const { data: recentData } = useQuery({
    queryKey: ['recent-promises'],
    queryFn: () => getPromises({ limit: 6, page: 1 })
  })
  const { data: parties } = useQuery({ queryKey: ['parties'], queryFn: getParties })

  const pieData = stats?.byStatus?.map(s => ({
    name: s.status.replace('_', ' '),
    value: s._count,
    color: STATUS_CHART_COLORS[s.status]
  })) || []

  const categoryData = stats?.byCategory?.slice(0, 8).map(c => ({
    name: CATEGORY_OPTIONS.find(o => o.value === c.category)?.label?.split(' ')[1] || c.category,
    count: c._count
  })) || []

  const delivered = stats?.byStatus?.find(s => s.status === 'DELIVERED')?._count || 0
  const total = stats?.total || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-blue-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-5xl mb-4">🇮🇳</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Indian Manifesto Tracker
          </h1>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Tracking {total.toLocaleString()}+ election promises made by Indian governments — from Parliament to Panchayat
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/promises"
              className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Browse All Promises →
            </Link>
            <Link
              to="/map"
              className="border border-blue-400 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors"
            >
              View India Map 🗺️
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-10">

        {/* Stats */}
        <StatsTicker />

        {/* Score + Pie chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreCard
            title="National Promise Delivery"
            total={total}
            delivered={delivered}
            party="BJP"
            color="#FF6600"
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Promise Status Breakdown</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">Loading chart...</div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map(d => (
                <span key={d.name} className="text-xs flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Category chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Promises by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">Loading chart...</div>
          )}
        </div>

        {/* Parties */}
        {parties?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏛️ Party Report Cards</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {parties.map(party => (
                <Link key={party.id} to={`/parties/${party.id}`}>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: party.colour }}
                    >
                      {party.shortName[0]}
                    </div>
                    <div className="font-bold text-sm text-gray-800">{party.shortName}</div>
                    <div className="text-xs text-gray-400">{party._count?.manifestos || 0} manifestos</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent promises */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📋 Latest Promises</h2>
            <Link to="/promises" className="text-blue-600 text-sm hover:underline">
              View all →
            </Link>
          </div>
          {recentData?.promises ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentData.promises.map(promise => (
                <PromiseCard key={promise.id} promise={promise} />
              ))}
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
    </div>
  )
}