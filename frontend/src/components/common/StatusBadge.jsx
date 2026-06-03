import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants'

export default function StatusBadge({ status, size = 'md' }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.NOT_STARTED
  const label = STATUS_LABELS[status] || status

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }[size]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClass}`}>
      <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
      {label}
    </span>
  )
}