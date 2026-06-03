import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPromises } from '../services/promiseService'
import PromiseCard from '../components/promises/PromiseCard'
import PromiseFilters from '../components/promises/PromiseFilters'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Promises() {
  const [filters, setFilters] = useState({ page: 1 })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['promises', filters],
    queryFn: () => getPromises(filters),
    keepPreviousData: true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📋 Promise Database</h1>
        <p className="text-gray-500 mt-1">
          Browse all {data?.pagination?.total?.toLocaleString() || '2,000+'} election promises
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <PromiseFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Promise grid */}
        <div className="flex-1">
          {isLoading ? (
            <LoadingSpinner message="Loading promises..." />
          ) : isError ? (
            <div className="text-center py-20 text-red-500">
              ❌ Failed to load promises. Is the backend running?
            </div>
          ) : data?.promises?.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p>No promises found for these filters</p>
              <button
                onClick={() => setFilters({ page: 1 })}
                className="mt-4 text-blue-600 underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {data?.promises?.map(promise => (
                  <PromiseCard key={promise.id} promise={promise} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {((filters.page - 1) * 20) + 1}–{Math.min(filters.page * 20, data?.pagination?.total)} of {data?.pagination?.total?.toLocaleString()} promises
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    ← Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {filters.page} of {data?.pagination?.totalPages}
                  </span>
                  <button
                    disabled={filters.page >= data?.pagination?.totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}