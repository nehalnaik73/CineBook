import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { PageLoader, Spinner } from '../components/Loader'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bookings')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cancelling, setCancelling] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { api.get('/bookings/my').then(({ data }) => { setBookings(data); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const handleSave = async (e) => { e.preventDefault(); setSaving(true); try { const { data } = await api.put('/auth/profile', form); updateUser(data); setSaved(true); setTimeout(() => setSaved(false), 2500) } finally { setSaving(false) } }
  const handleCancel = async (id) => { if (!confirm('Cancel this booking?')) return; setCancelling(id); try { await api.put(`/bookings/${id}/cancel`); setBookings(prev => prev.map(b => b.id===id ? {...b, status:'cancelled'} : b)) } catch (err) { alert(err.response?.data?.message||'Failed.') } finally { setCancelling(null) } }
  const handleLogout = () => { logout(); navigate('/') }

  const filtered = filter==='all' ? bookings : bookings.filter(b => b.status===filter)
  const stats = { total: bookings.length, confirmed: bookings.filter(b => b.status==='confirmed').length, spent: bookings.filter(b => b.status==='confirmed').reduce((s,b) => s+b.totalAmount, 0) }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header card */}
      <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-stone-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-2xl font-bold text-white shadow-md shadow-rose-200 flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h1 className="text-stone-900 text-2xl font-bold">{user?.name}</h1>
          <p className="text-stone-400 text-sm">{user?.email}</p>
          {user?.phone && <p className="text-stone-400 text-xs mt-0.5">{user?.phone}</p>}
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && <Link to="/admin" className="btn-outline text-sm py-2">⚙️ Admin</Link>}
          <button onClick={handleLogout} className="btn-danger text-sm py-2">Sign Out</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[['🎟️', 'Bookings', stats.total, 'text-stone-800'], ['✅', 'Confirmed', stats.confirmed, 'text-emerald-600'], ['💰', 'Total Spent', `₹${stats.spent.toLocaleString('en-IN')}`, 'text-rose-600']].map(([icon, label, val, c]) => (
          <div key={label} className="card p-5 text-center shadow-sm">
            <div className="text-2xl mb-1">{icon}</div>
            <p className={`font-bold text-lg ${c}`}>{val}</p>
            <p className="text-stone-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit mb-6">
        {[['bookings','🎟️','My Bookings'], ['settings','⚙️','Settings']].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab===id ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Bookings tab */}
      {tab === 'bookings' && (
        <div>
          <div className="flex gap-2 mb-5">
            {['all','confirmed','cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize border transition-all ${filter===f ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-stone-400 border-stone-200 hover:border-rose-300'}`}>{f}</button>
            ))}
          </div>
          {loading ? <PageLoader /> : filtered.length === 0 ? (
            <div className="card py-16 text-center shadow-sm">
              <div className="text-5xl mb-3">🎬</div>
              <p className="text-stone-400 text-sm mb-4">{filter!=='all' ? `No ${filter} bookings.` : 'No bookings yet.'}</p>
              {filter==='all' && <Link to="/movies" className="btn-primary text-sm">Book Your First Movie</Link>}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(b => {
                const seatLabels = b.seats?.map(bs => `${bs.seat?.row}${bs.seat?.number}`).join(', ') || '—'
                return (
                  <div key={b.id} className="card shadow-sm">
                    <div className="p-5">
                      <div className="flex gap-4 items-start">
                        {b.show?.movie?.poster && <img src={b.show.movie.poster} alt="" className="w-14 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm" onError={e => e.target.style.display='none'} />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-stone-800 font-bold leading-tight">{b.show?.movie?.title}</h3>
                            <span className={`badge border text-xs flex-shrink-0 ${b.status==='confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{b.status}</span>
                          </div>
                          <p className="text-stone-400 text-xs">{b.show?.theater?.name} · {b.show?.theater?.city}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-stone-400">
                            <span>📅 {b.show?.date}</span><span>🕐 {b.show?.time}</span><span>🎬 {b.show?.format}</span>
                          </div>
                          <p className="text-stone-400 text-xs mt-1">💺 {seatLabels}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 border-t border-stone-50 bg-stone-50 rounded-b-2xl flex items-center justify-between">
                      <div><span className="text-emerald-600 font-bold">₹{b.totalAmount?.toFixed(2)}</span><span className="text-stone-400 text-xs ml-2">#{b.id}</span></div>
                      <div className="flex gap-3">
                        {b.status==='confirmed' && <Link to={`/confirmation/${b.id}`} className="text-xs text-stone-400 hover:text-rose-600 transition-colors">View Ticket →</Link>}
                        {b.status==='confirmed' && <button onClick={() => handleCancel(b.id)} disabled={cancelling===b.id} className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">{cancelling===b.id ? <Spinner size="sm" /> : 'Cancel'}</button>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="card p-6 shadow-sm fade-in">
          <h2 className="text-stone-800 font-bold text-lg mb-6">Profile Settings</h2>
          <form onSubmit={handleSave} className="space-y-5 max-w-md">
            <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div><label className="label">Phone Number</label><input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+91 98765 43210" /></div>
            <div><label className="label">Email</label><input className="input opacity-50" value={user?.email} disabled /><p className="text-stone-400 text-xs mt-1">Email cannot be changed.</p></div>
            {saved && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">✓ Profile updated!</div>}
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <><Spinner size="sm" />Saving…</> : 'Save Changes'}</button>
          </form>
        </div>
      )}
    </div>
  )
}
