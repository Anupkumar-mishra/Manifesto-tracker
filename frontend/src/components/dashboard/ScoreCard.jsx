export default function ScoreCard({ title, total, delivered, party, color }) {
  const score = total > 0 ? Math.round((delivered / total) * 100) : 0

  const getScoreColor = (s) => {
    if (s >= 70) return 'text-green-600'
    if (s >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">{title}</h3>
        {party && (
          <span
            className="text-xs font-bold px-2 py-1 rounded text-white"
            style={{ backgroundColor: color || '#1e40af' }}
          >
            {party}
          </span>
        )}
      </div>

      <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
        {score}%
      </div>
      <p className="text-sm text-gray-500 mb-4">Promise Delivery Rate</p>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${
            score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{delivered} delivered</span>
        <span>{total} total promises</span>
      </div>
    </div>
  )
}