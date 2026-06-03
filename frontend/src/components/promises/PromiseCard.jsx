import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge'
import { CATEGORY_OPTIONS } from '../../utils/constants'

export default function PromiseCard({ promise }) {
  const categoryLabel = CATEGORY_OPTIONS.find(c => c.value === promise.category)?.label || promise.category
  const party = promise.manifesto?.party

  return (
    <Link to={`/promises/${promise.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col gap-3">
        
        {/* Party + Category */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {party && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: party.colour || '#1e40af' }}
              >
                {party.shortName}
              </span>
            )}
            <span className="text-xs text-gray-500">{categoryLabel}</span>
          </div>
          <StatusBadge status={promise.status} size="sm" />
        </div>

        {/* Promise text */}
        <p className="text-gray-800 text-sm font-medium leading-relaxed flex-1 line-clamp-3">
          {promise.text}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
          <span>📍 {promise.region?.name || 'India'}</span>
          <div className="flex items-center gap-3">
            {promise.statedDeadline && (
              <span>⏱ {promise.statedDeadline}</span>
            )}
            <span>👁 {promise.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}