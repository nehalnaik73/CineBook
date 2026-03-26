import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { SkeletonRow, Spinner } from '../../components/Loader'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [cancelling, setCancelling] = useState(null)

  const fetchBookings = () => api.get('/bookings/all').then(({ data }) => { setBookings(data); setLoading(false) })
  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Force cancel this booking?')) return
    setCancelling(id)
    try { await api.put(`/bookings/${id}/cancel`); fetchBookings() }
    catch (err) { alert(err.response?.data?.message || 'Failed.') }
    finally { setCancelling(null) }
  }

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return b.user?.name?.toLowerCase().includes(q) || b.show?.movie?.title?.toLowerCase().includes(q) || String(b.id).includes(q)
  })

  const stats = { total: bookings.length, confirmed: bookings.filter(b => b.status==='confirmed').length, cancelled: bookings.filter(b => b.status==='cancelled').length, revenue: bookings.filter(b => b.status==='confirmed').reduce((s,b) => s+b.totalAmount, 0) }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-1">Admin / Manage</p>
        <h1 className="font-display text-5xl text-stone-900 font-bold">Bookings</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[['Total', stats.total, 'text-stone-800'], ['Confirmed', stats.confirmed, 'text-emerald-600'], ['Cancelled', stats.cancelled, 'text-red-500'], ['Revenue', `₹${stats.revenue.toLocaleString('en-IN')}`, 'text-rose-600']].map(([l, v, c]) => (
          <div key={l} className="card p-5"><p className="text-stone-400 text-xs uppercase tracking-wider mb-1">{l}</p><p className={`text-2xl font-bold font-display ${c}`}>{v}</p></div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="input pl-11" placeholder="Search bookings…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          {['all','confirmed','cancelled','pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter===f ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">User</th>
                <th className="table-th">Movie / Show</th>
                <th className="table-th hidden lg:table-cell">Seats</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? Array(6).fill(0).map((_,i) => <SkeletonRow key={i} />) : filtered.map(b => {
                const seats = b.seats?.map(bs => `${bs.seat?.row}${bs.seat?.number}`).join(', ') || '—'
                return (
                  <tr key={b.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="table-td text-stone-400 font-mono text-xs">#{b.id}</td>
                    <td className="table-td"><p className="text-stone-800 font-semibold text-sm">{b.user?.name}</p><p className="text-stone-400 text-xs">{b.user?.email}</p></td>
                    <td className="table-td"><p className="text-stone-700 font-medium text-sm">{b.show?.movie?.title}</p><p className="text-stone-400 text-xs">{b.show?.theater?.name} · {b.show?.date}</p></td>
                    <td className="table-td text-stone-400 text-xs hidden lg:table-cell max-w-[120px] truncate">{seats}</td>
                    <td className="table-td"><span className="text-emerald-600 font-bold text-sm">₹{b.totalAmount?.toFixed(2)}</span></td>
                    <td className="table-td"><span className={`badge border ${b.status==='confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : b.status==='cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{b.status}</span></td>
                    <td className="table-td text-right">{b.status==='confirmed' && <button onClick={() => handleCancel(b.id)} disabled={cancelling===b.id} className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity">{cancelling===b.id ? <Spinner size="sm" /> : 'Cancel'}</button>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && filtered.length===0 && <div className="py-16 text-center"><div className="text-4xl mb-3">🎟️</div><p className="text-stone-400 text-sm">No bookings found.</p></div>}
        </div>
      </div>
    </div>
  )
}
