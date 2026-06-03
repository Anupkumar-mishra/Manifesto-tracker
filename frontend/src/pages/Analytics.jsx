import { useQuery } from '@tanstack/react-query'
import { getStats, getParties } from '../services/promiseService'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatusBadge from '../components/common/StatusBadge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { CATEGORY_OPTIONS } from '../utils/constants'

const STATUS_COLORS = {
  DELIVERED: '#22c55e',
  IN_PROGRESS: '#3b82f6',
  STALLED: '#f97316',
  BROKEN: '#ef4444',
  NOT_STARTED: '#9ca3af',
}

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats
  })
  const { data: parties } = useQuery({
    queryKey: ['parties'],
    queryFn: getParties
  })

  if (isLoading) return <LoadingSpinner message="Loading analytics..." />

  const total = stats?.total || 0
  const delivered = stats?.byStatus?.find(s => s.status === 'DELIVERED')?._count || 0
  const broken = stats?.byStatus?.find(s => s.status === 'BROKEN')?._count || 0
  const inProgress = stats?.byStatus?.find(s => s.status === 'IN_PROGRESS')?._count || 0
  const stalled = stats?.byStatus?.find(s => s.status === 'STALLED')?._count || 0
  const notStarted = stats?.byStatus?.find(s => s.status === 'NOT_STARTED')?._count || 0
  const score = total > 0 ? Math.round((delivered / total) * 100) : 0

  const statusData = [
    { name: 'Delivered', value: delivered, color: '#22c55e' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Stalled', value: stalled, color: '#f97316' },
    { name: 'Broken', value: broken, color: '#ef4444' },
    { name: 'Not Started', value: notStarted, color: '#9ca3af' },
  ]

  const categoryData = stats?.byCategory?.map(c => ({
    name: CATEGORY_OPTIONS.find(o => o.value === c.category)?.label?.split(' ')[1] || c.category,
    count: c._count,
    fullName: c.category
  })).sort((a, b) => b.count - a.count) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📈 Analytics</h1>
        <p className="text-gray-500 mt-1">Platform-wide promise delivery insights</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: total, color: 'bg-blue-50 text-blue-600' },
          { label: 'Delivered', value: delivered, color: 'bg-green-50 text-green-600' },
          { label: 'In Progress', value: inProgress, color: 'bg-blue-50 text-blue-500' },
          { label: 'Stalled', value: stalled, color: 'bg-orange-50 text-orange-600' },
          { label: 'Broken', value: broken, color: 'bg-red-50 text-red-600' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-4 text-center`}>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <div className="text-sm mt-1 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Overall score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">🎯 Overall Delivery Score</h3>
          <div className="flex items-center gap-6">
            <div className={`text-6xl font-bold ${score >= 50 ? 'text-green-600' : score >= 25 ? 'text-orange-500' : 'text-red-600'}`}>
              {score}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full ${score >= 50 ? 'bg-green-500' : score >= 25 ? 'bg-orange-500' : 'bg-red-500'}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{delivered} of {total} promises delivered</p>
            </div>
          </div>
        </div>

        {/* Status pie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Status Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={70}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-1">
            {statusData.map(d => (
              <span key={d.name} className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="font-bold text-gray-800 mb-4">📁 Promises by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
            <Tooltip />
            <Bar dataKey="count" fill="#1e40af" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Party comparison */}
      {parties?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-4">🏛️ Party Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {parties.map(party => (
              <Link key={party.id} to={`/parties/${party.id}`}>
                <div className="text-center p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: party.colour }}
                  >
                    {party.shortName[0]}
                  </div>
                  <div className="font-bold text-sm">{party.shortName}</div>
                  <div className="text-xs text-gray-400">{party.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Download section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-2">📥 Download Data</h3>
        <p className="text-sm text-blue-700 mb-4">Download the full promise database for research</p>
        <div className="flex gap-3">
         <a 
            href="http://localhost:3001/api/export/csv"
            className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
          >
            Download CSV
          </a>
          <a
            href="http://localhost:3001/api/export/json"
            className="bg-white text-blue-900 border border-blue-200 px-4 py-2 rounded-lg text-sm hover:bg-blue-50"
          >
            Download JSON
          </a>
        </div>
      </div>
    </div>
  )
}