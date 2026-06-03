import { useQuery } from '@tanstack/react-query'
import { getStats } from '../../services/promiseService'

export default function StatsTicker() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats
  })

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  )

  const delivered = data?.byStatus?.find(s => s.status === 'DELIVERED')?._count || 0
  const broken = data?.byStatus?.find(s => s.status === 'BROKEN')?._count || 0
  const inProgress = data?.byStatus?.find(s => s.status === 'IN_PROGRESS')?._count || 0
  const total = data?.total || 0

  const stats = [
    { label: 'Total Promises', value: total, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📋' },
    { label: 'Delivered', value: delivered, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
    { label: 'In Progress', value: inProgress, color: 'text-blue-500', bg: 'bg-blue-50', icon: '🔄' },
    { label: 'Broken', value: broken, color: 'text-red-600', bg: 'bg-red-50', icon: '❌' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.label} className={`${stat.bg} rounded-xl p-5 text-center`}>
          <div className="text-3xl mb-1">{stat.icon}</div>
          <div className={`text-3xl font-bold ${stat.color}`}>
            {stat.value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}