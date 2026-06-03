import { STATUS_OPTIONS, CATEGORY_OPTIONS } from '../../utils/constants'

export default function PromiseFilters({ filters, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
      <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Filters</h3>

      {/* Search */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Search</label>
        <input
          type="text"
          placeholder="Search promises..."
          value={filters.search || ''}
          onChange={e => onChange({ ...filters, search: e.target.value, page: 1 })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Status */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Status</label>
        <select
          value={filters.status || ''}
          onChange={e => onChange({ ...filters, status: e.target.value, page: 1 })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Category</label>
        <select
          value={filters.category || ''}
          onChange={e => onChange({ ...filters, category: e.target.value, page: 1 })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({})}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm py-2 rounded-lg transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}