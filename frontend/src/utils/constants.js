export const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DELIVERED', label: '✅ Delivered' },
  { value: 'IN_PROGRESS', label: '🔄 In Progress' },
  { value: 'STALLED', label: '⏸ Stalled' },
  { value: 'BROKEN', label: '❌ Broken' },
  { value: 'NOT_STARTED', label: '⬜ Not Started' },
]

export const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'HEALTH', label: '🏥 Health' },
  { value: 'EDUCATION', label: '📚 Education' },
  { value: 'INFRASTRUCTURE', label: '🏗️ Infrastructure' },
  { value: 'AGRICULTURE', label: '🌾 Agriculture' },
  { value: 'EMPLOYMENT', label: '💼 Employment' },
  { value: 'ECONOMY', label: '💰 Economy' },
  { value: 'WOMEN', label: '👩 Women' },
  { value: 'YOUTH', label: '🧑 Youth' },
  { value: 'ENVIRONMENT', label: '🌿 Environment' },
  { value: 'DEFENCE', label: '🛡️ Defence' },
  { value: 'GOVERNANCE', label: '🏛️ Governance' },
  { value: 'SOCIAL_WELFARE', label: '🤝 Social Welfare' },
  { value: 'OTHER', label: '📌 Other' },
]

export const STATUS_COLORS = {
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  STALLED: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  BROKEN: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  NOT_STARTED: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' },
}

export const STATUS_LABELS = {
  DELIVERED: '✅ Delivered',
  IN_PROGRESS: '🔄 In Progress',
  STALLED: '⏸ Stalled',
  BROKEN: '❌ Broken',
  NOT_STARTED: '⬜ Not Started',
}

export const PARTY_COLORS = {
  BJP: '#FF6600',
  INC: '#00BFFF',
  AAP: '#0066CC',
  TMC: '#00AA00',
  SP: '#FF0000',
  DMK: '#CC0000',
}