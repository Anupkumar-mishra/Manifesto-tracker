import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatusBadge from '../components/common/StatusBadge'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
const STATUS_OPTIONS = ['DELIVERED', 'IN_PROGRESS', 'STALLED', 'BROKEN', 'NOT_STARTED']
const CATEGORY_OPTIONS = ['AGRICULTURE', 'ECONOMY', 'EDUCATION', 'ENERGY', 'ENVIRONMENT', 'HEALTHCARE', 'INFRASTRUCTURE', 'SECURITY', 'SOCIAL_WELFARE', 'TECHNOLOGY', 'OTHER']
const PAGE_SIZE = 15
const BASE = 'http://localhost:3001'

const EMPTY_FORM = { text: '', category: '', status: 'NOT_STARTED', partyId: '', regionId: '' }

// ─── tiny helpers ────────────────────────────────────────────────────────────
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD, ...opts.headers },
    ...opts
  })

function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
      ${type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
      {msg}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function PromiseForm({ initial = EMPTY_FORM, parties = [], regions = [], onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Promise Text *</label>
        <textarea
          rows={3}
          value={form.text}
          onChange={e => set('text', e.target.value)}
          placeholder="Enter the promise text..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Category *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Select…</option>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Party</label>
          <select value={form.partyId} onChange={e => set('partyId', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Select…</option>
            {parties.map(p => <option key={p.id} value={p.id}>{p.shortName || p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Region</label>
          <select value={form.regionId} onChange={e => set('regionId', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Select…</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={() => onSave(form)} disabled={saving || !form.text || !form.category}
          className="px-5 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Promise'}
        </button>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [promises, setPromises] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loadingList, setLoadingList] = useState(false)

  const [toast, setToast] = useState({ msg: '', type: 'success' })
  const [modal, setModal] = useState(null) // 'add' | 'edit' | 'delete'
  const [activePromise, setActivePromise] = useState(null)
  const [saving, setSaving] = useState(false)

  // inline status edit
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('')

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch(`${BASE}/api/promises/stats`).then(r => r.json()),
    enabled: authenticated
  })

  const { data: parties = [] } = useQuery({
    queryKey: ['parties'],
    queryFn: () => fetch(`${BASE}/api/parties`).then(r => r.json()).then(d => d.parties || d || []),
    enabled: authenticated
  })

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => fetch(`${BASE}/api/regions`).then(r => r.json()).then(d => d.regions || d || []),
    enabled: authenticated
  })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }

  const loadPromises = useCallback(async (p = page, s = search, st = filterStatus) => {
    setLoadingList(true)
    try {
      const params = new URLSearchParams({ limit: PAGE_SIZE, page: p })
      if (s) params.append('search', s)
      if (st) params.append('status', st)
      const res = await fetch(`${BASE}/api/promises?${params}`)
      const data = await res.json()
      setPromises(data.promises || [])
      setTotal(data.pagination?.total || 0)
    } catch {
      showToast('Failed to load promises', 'error')
    } finally {
      setLoadingList(false)
    }
  }, [page, search, filterStatus])

  useEffect(() => { if (authenticated) loadPromises(page, search, filterStatus) }, [authenticated, page, search, filterStatus])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── auth ──
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setLoginError('') }
    else setLoginError('Wrong password!')
  }

  // ── inline status update ──
  const handleInlineStatusSave = async (id) => {
    if (!editStatus) return
    setSaving(true)
    try {
      const res = await apiFetch(`/api/promises/${id}`, {
        method: 'PATCH', body: JSON.stringify({ status: editStatus, reason: 'Admin update' })
      })
      if (res.ok) { showToast('Status updated ✓'); setEditingId(null); loadPromises(); refetchStats() }
      else showToast('Update failed', 'error')
    } catch { showToast('Update failed', 'error') }
    finally { setSaving(false) }
  }

  // ── add promise ──
  const handleAdd = async (form) => {
    setSaving(true)
    try {
      const res = await apiFetch('/api/promises', { method: 'POST', body: JSON.stringify(form) })
      if (res.ok) { showToast('Promise added ✓'); setModal(null); loadPromises(1); setPage(1); refetchStats() }
      else { const e = await res.json(); showToast(e.error || 'Add failed', 'error') }
    } catch { showToast('Add failed', 'error') }
    finally { setSaving(false) }
  }

  // ── edit promise (full) ──
  const handleEdit = async (form) => {
    setSaving(true)
    try {
      const res = await apiFetch(`/api/promises/${activePromise.id}`, { method: 'PATCH', body: JSON.stringify(form) })
      if (res.ok) { showToast('Promise updated ✓'); setModal(null); loadPromises(); refetchStats() }
      else { const e = await res.json(); showToast(e.error || 'Update failed', 'error') }
    } catch { showToast('Update failed', 'error') }
    finally { setSaving(false) }
  }

  // ── delete ──
  const handleDelete = async () => {
    setSaving(true)
    try {
      const res = await apiFetch(`/api/promises/${activePromise.id}`, { method: 'DELETE' })
      if (res.ok) { showToast('Promise deleted'); setModal(null); loadPromises(); refetchStats() }
      else showToast('Delete failed', 'error')
    } catch { showToast('Delete failed', 'error') }
    finally { setSaving(false) }
  }

  // ── bulk delete ──
  const [selected, setSelected] = useState(new Set())
  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelected(s => s.size === promises.length ? new Set() : new Set(promises.map(p => p.id)))

  const handleBulkDelete = async () => {
    if (!selected.size) return
    setSaving(true)
    try {
      await Promise.all([...selected].map(id =>
        apiFetch(`/api/promises/${id}`, { method: 'DELETE' })
      ))
      showToast(`Deleted ${selected.size} promise(s)`)
      setSelected(new Set())
      loadPromises()
      refetchStats()
    } catch { showToast('Bulk delete failed', 'error') }
    finally { setSaving(false) }
  }

  // ── login screen ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚙️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Manifesto Tracker</p>
          </div>
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
          />
          {loginError && <p className="text-red-500 text-xs mb-3">{loginError}</p>}
          <button onClick={handleLogin}
            className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 text-sm">
            Login →
          </button>
        </div>
      </div>
    )
  }

  // ── main admin ──
  return (
    <div className="min-h-screen bg-gray-50">
      <Toast msg={toast.msg} type={toast.type} />

      {/* Modals */}
      {modal === 'add' && (
        <Modal title="➕ Add New Promise" onClose={() => setModal(null)}>
          <PromiseForm parties={parties} regions={regions} onSave={handleAdd} onCancel={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal === 'edit' && activePromise && (
        <Modal title="✏️ Edit Promise" onClose={() => setModal(null)}>
          <PromiseForm
            initial={{
              text: activePromise.text || '',
              category: activePromise.category || '',
              status: activePromise.status || 'NOT_STARTED',
              partyId: activePromise.manifesto?.party?.id || '',
              regionId: activePromise.region?.id || ''
            }}
            parties={parties} regions={regions}
            onSave={handleEdit} onCancel={() => setModal(null)} saving={saving}
          />
        </Modal>
      )}
      {modal === 'delete' && activePromise && (
        <Modal title="🗑️ Delete Promise" onClose={() => setModal(null)}>
          <p className="text-gray-700 text-sm mb-4">Are you sure you want to delete this promise? This cannot be undone.</p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-5 line-clamp-3">{activePromise.text}</div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleDelete} disabled={saving}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center text-lg">⚙️</div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-none">Admin Panel</h1>
              <p className="text-xs text-gray-400">Manifesto Tracker</p>
            </div>
          </div>
          <button onClick={() => setAuthenticated(false)}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'bg-blue-900 text-white' },
              ...(stats.byStatus?.map(s => ({
                label: s.status.replace('_', ' '),
                value: s._count,
                color: s.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                       s.status === 'BROKEN' ? 'bg-red-50 text-red-700 border border-red-100' :
                       s.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                       s.status === 'STALLED' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                       'bg-gray-50 text-gray-600 border border-gray-100'
              })) || [])
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
                <div className="text-2xl font-bold">{s.value?.toLocaleString()}</div>
                <div className="text-xs mt-0.5 opacity-75">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="flex gap-2">
                <input type="text" placeholder="Search promises…" value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button onClick={() => { setSearch(searchInput); setPage(1) }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm">
                  🔍
                </button>
                {(search || filterStatus) && (
                  <button onClick={() => { setSearch(''); setSearchInput(''); setFilterStatus(''); setPage(1) }}
                    className="text-xs text-red-500 hover:underline px-1">Clear</button>
                )}
              </div>
              {/* Filter by status */}
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              {selected.size > 0 && (
                <button onClick={handleBulkDelete} disabled={saving}
                  className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                  🗑️ Delete {selected.size} selected
                </button>
              )}
              <button onClick={() => setModal('add')}
                className="flex items-center gap-1.5 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
                ➕ Add Promise
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <span className="text-sm font-semibold text-gray-700">
              {total.toLocaleString()} promise{total !== 1 ? 's' : ''}
              {search && <span className="text-gray-400"> for "{search}"</span>}
            </span>
            <span className="text-xs text-gray-400">Page {page} of {totalPages || 1}</span>
          </div>

          {loadingList ? (
            <div className="py-16 flex justify-center"><LoadingSpinner /></div>
          ) : promises.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No promises found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-4 w-10">
                      <input type="checkbox" checked={selected.size === promises.length && promises.length > 0}
                        onChange={toggleAll} className="rounded" />
                    </th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium">Promise</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium w-32">Category</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium w-36">Status</th>
                    <th className="text-left py-3 px-3 text-gray-500 font-medium w-48">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {promises.map(promise => (
                    <tr key={promise.id}
                      className={`hover:bg-gray-50 transition-colors ${selected.has(promise.id) ? 'bg-blue-50' : ''}`}>
                      <td className="py-3 px-4">
                        <input type="checkbox" checked={selected.has(promise.id)}
                          onChange={() => toggleSelect(promise.id)} className="rounded" />
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-gray-800 line-clamp-2 leading-snug">{promise.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {promise.manifesto?.party?.shortName && <span className="font-medium">{promise.manifesto.party.shortName}</span>}
                          {promise.region?.name && <span> · {promise.region.name}</span>}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {promise.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {editingId === promise.id ? (
                          <div className="flex flex-col gap-1.5">
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                              className="border border-gray-200 rounded-md px-2 py-1 text-xs w-full focus:outline-none focus:ring-2 focus:ring-blue-300">
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                            <div className="flex gap-1">
                              <button onClick={() => handleInlineStatusSave(promise.id)} disabled={saving}
                                className="flex-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded disabled:opacity-50">Save</button>
                              <button onClick={() => setEditingId(null)}
                                className="flex-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">×</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={promise.status} size="sm" />
                            <button onClick={() => { setEditingId(promise.id); setEditStatus(promise.status) }}
                              className="text-gray-300 hover:text-blue-500 text-xs" title="Quick edit status">✏️</button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setActivePromise(promise); setModal('edit') }}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium">
                            Edit
                          </button>
                          <button
                            onClick={() => { setActivePromise(promise); setModal('delete') }}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1}
                  className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50">«</button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50">‹ Prev</button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p
                  if (totalPages <= 5) p = i + 1
                  else if (page <= 3) p = i + 1
                  else if (page >= totalPages - 2) p = totalPages - 4 + i
                  else p = page - 2 + i
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium ${p === page ? 'bg-blue-900 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                      {p}
                    </button>
                  )
                })}

                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next ›</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  className="px-2 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50">»</button>
              </div>
            </div>
          )}
        </div>

        {/* Export */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">📥 Export Data</h3>
          <div className="flex gap-3">
            <a href={`${BASE}/api/export/csv`}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">Export CSV</a>
            <a href={`${BASE}/api/export/json`}
              className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Export JSON</a>
          </div>
        </div>

      </div>
    </div>
  )
}