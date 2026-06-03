import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPromiseById } from '../services/promiseService'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { CATEGORY_OPTIONS } from '../utils/constants'

export default function PromiseDetail() {
  const { id } = useParams()

  const { data: promise, isLoading, isError } = useQuery({
    queryKey: ['promise', id],
    queryFn: () => getPromiseById(id)
  })

  if (isLoading) return <LoadingSpinner message="Loading promise..." />

  if (isError) return (
    <div className="text-center py-20 text-red-500">
      <div className="text-5xl mb-4">❌</div>
      <p>Promise not found</p>
      <Link to="/promises" className="block mt-4 text-blue-600 underline">
        ← Back to promises
      </Link>
    </div>
  )

  const party = promise.manifesto?.party
  const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === promise.category)?.label

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/promises" className="text-blue-600 text-sm hover:underline mb-6 block">
        ← Back to all promises
      </Link>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {party && (
            <span
              className="text-sm font-bold px-3 py-1 rounded text-white"
              style={{ backgroundColor: party.colour }}
            >
              {party.name}
            </span>
          )}
          <StatusBadge status={promise.status} size="lg" />
          {categoryLabel && (
            <span className="text-sm bg-gray-100 px-3 py-1 rounded text-gray-600">
              {categoryLabel}
            </span>
          )}
        </div>

        {/* Promise text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-relaxed">
          {promise.text}
        </h1>

        {/* AI Summary */}
        {promise.summary && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="text-xs font-bold text-blue-600 mb-1">🤖 AI Summary</div>
            <p className="text-sm text-blue-900">{promise.summary}</p>
            {promise.confidenceScore && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-blue-500">Confidence:</span>
                <div className="flex-1 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${promise.confidenceScore * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-blue-600 font-bold">
                  {Math.round(promise.confidenceScore * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {promise.region?.name && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Region</div>
              <div className="text-sm font-medium text-gray-800">{promise.region.name}</div>
            </div>
          )}
          {promise.government?.name && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Government</div>
              <div className="text-sm font-medium text-gray-800">{promise.government.name}</div>
            </div>
          )}
          {promise.manifesto?.electionYear && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Election Year</div>
              <div className="text-sm font-medium text-gray-800">{promise.manifesto.electionYear}</div>
            </div>
          )}
          {promise.targetGroup && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Target Group</div>
              <div className="text-sm font-medium text-gray-800">{promise.targetGroup}</div>
            </div>
          )}
          {promise.statedDeadline && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Deadline</div>
              <div className="text-sm font-medium text-gray-800">{promise.statedDeadline}</div>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Views</div>
            <div className="text-sm font-medium text-gray-800">{promise.viewCount || 0}</div>
          </div>
        </div>
      </div>

      {/* Status History */}
      {promise.statusHistory?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">📅 Status History</h2>
          <div className="flex flex-col gap-3">
            {promise.statusHistory.map((h) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {h.oldStatus ? `${h.oldStatus} → ${h.newStatus}` : h.newStatus}
                  </div>
                  {h.reason && (
                    <div className="text-xs text-gray-400">{h.reason}</div>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(h.changedAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence / News */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4">📰 Evidence & News</h2>
        {!promise.evidence || promise.evidence.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">No news articles linked yet.</p>
            <p className="text-xs mt-1">The news scraper will add articles automatically.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {promise.evidence.map((ev) => (
              <a
                key={ev.id}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {ev.source}
                  </span>
                  <div className="flex items-center gap-2">
                    {ev.verified && (
                      <span className="text-xs text-green-600 font-medium">✅ Verified</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {ev.publishedAt ? new Date(ev.publishedAt).toLocaleDateString('en-IN') : ''}
                    </span>
                  </div>
                </div>
                <div className="font-medium text-gray-800 text-sm mb-1">{ev.title}</div>
                {ev.snippet && (
                  <div className="text-xs text-gray-500 line-clamp-2">{ev.snippet}</div>
                )}
                <div className="text-xs text-blue-500 mt-2">Read full article →</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}