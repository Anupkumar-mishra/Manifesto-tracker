import api from './api'

export const getPromises = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.category) params.append('category', filters.category)
  if (filters.search) params.append('search', filters.search)
  if (filters.page) params.append('page', filters.page)
  params.append('limit', filters.limit || 20)
  const res = await api.get(`/api/promises?${params}`)
  return res.data
}

export const getPromiseById = async (id) => {
  const res = await api.get(`/api/promises/${id}`)
  return res.data
}

export const getStats = async () => {
  const res = await api.get('/api/promises/stats')
  return res.data
}

export const getParties = async () => {
  const res = await api.get('/api/parties')
  return res.data
}

export const getRegions = async () => {
  const res = await api.get('/api/regions')
  return res.data
}

export const sendChatMessage = async (question) => {
  const res = await api.post('/api/chat', { question })
  return res.data
}