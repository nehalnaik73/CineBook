import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Spinner, SkeletonRow } from '../../components/Loader'

const EMPTY = { movieId:'', theaterId:'', date:'', time:'', format:'2D', price:'', rows:'8', seatsPerRow:'10' }
const FORMATS = ['2D','3D','IMAX','4DX']
const FORMAT_BADGE = { '2D':'bg-stone-100 text-stone-600', '3D':'bg-blue-100 text-blue-700', 'IMAX':'bg-purple-100 text-purple-700', '4DX':'bg-amber-100 text-amber-700' }
const TIMES = ['09:00 AM','10:30 AM','12:00 PM','01:30 PM','03:00 PM','04:30 PM','06:00 PM','07:30 PM','09:00 PM','10:30 PM','11:59 PM']

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal"><div className="flex items-center justify-between mb-6"><h2 className="text-stone-800 font-bold text-lg">{title}</h2><button onClick={onClose} className="text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100">✕</button></div>{children}</div>
    </div>
  )
}

export default function AdminShows() {
  const [shows, setShows] = useState([])
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const fetchShows = () => api.get('/shows').then(({ data }) => { setShows(data); setLoading(false) })
  useEffect(() => { fetchShows(); api.get('/movies?limit=200').then(({ data }) => setMovies(data.movies)); api.get('/theaters').then(({ data }) => setTheaters(data)) }, [])
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowModal(true) }
  const openEdit = (s) => { setEditing(s.id); setForm({ movieId:s.movieId, theaterId:s.theaterId, date:s.date, time:s.time, format:s.format, price:s.price, rows:'8', seatsPerRow:'10' }); setError(''); setShowModal(true) }
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try { editing ? await api.put(`/shows/${editing}`, form) : await api.post('/shows', form); fetchShows(); setShowModal(false) }
    catch (err) { setError(err.response?.data?.message || 'Failed.') }
    finally { setSaving(false) }
  }
  const handleDelete = async (id) => { if (!confirm('Delete this show?')) return; try { await api.delete(`/shows/${id}`); fetchShows() } catch { alert('Failed.') } }

  const filtered = shows.filter(s => { if (filterDate && s.date!==filterDate) return false; if (!search) return true; const q=search.toLowerCase(); return s.movie?.title?.toLowerCase().includes(q)||s.theater?.name?.toLowerCase().includes(q) })
  const grouped = filtered.reduce((acc, s) => { (acc[s.date]=acc[s.date]||[]).push(s); return acc }, {})
  const sortedDates = Object.keys(grouped).sort()
  const today = new Date().toISOString().split('T')[0]
  const formatDate = (d) => { if (d===today) return 'Today'; const dt=new Date(d+'T00:00:00'); return dt.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-1">Admin / Manage</p>
          <h1 className="font-display text-5xl text-stone-900 font-bold">Shows</h1>
          <p className="text-stone-400 text-sm mt-1">{shows.length} screenings scheduled</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">+ Create Show</button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48"><svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input className="input pl-11" placeholder="Search movie or theater…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <input type="date" className="input w-44" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        {(search||filterDate) && <button onClick={() => { setSearch(''); setFilterDate('') }} className="btn-outline text-sm px-4">Clear</button>}
      </div>

      {loading ? <div className="card"><table className="w-full"><tbody>{Array(5).fill(0).map((_,i) => <SkeletonRow key={i} />)}</tbody></table></div>
      : filtered.length===0 ? <div className="card py-20 text-center shadow-sm"><div className="text-5xl mb-4">📅</div><p className="text-stone-400 mb-4">{search||filterDate ? 'No shows match.' : 'No shows yet.'}</p>{!search&&!filterDate&&<button onClick={openAdd} className="btn-primary">Create First Show</button>}</div>
      : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`badge text-xs px-3 ${date===today ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600'}`}>{formatDate(date)}</div>
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-stone-400 text-xs">{grouped[date].length} show{grouped[date].length!==1?'s':''}</span>
              </div>
              <div className="card overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="border-b border-stone-100 bg-stone-50"><tr><th className="table-th">Movie</th><th className="table-th">Theater</th><th className="table-th">Time</th><th className="table-th hidden sm:table-cell">Format</th><th className="table-th hidden md:table-cell">Price</th><th className="table-th text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-stone-50">
                    {grouped[date].map(s => (
                      <tr key={s.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="table-td"><p className="text-stone-800 font-semibold text-sm">{s.movie?.title}</p><p className="text-stone-400 text-xs">{s.movie?.language} · {s.movie?.duration}m</p></td>
                        <td className="table-td"><p className="text-stone-600 text-sm">{s.theater?.name}</p><p className="text-stone-400 text-xs">{s.theater?.city}</p></td>
                        <td className="table-td"><span className="text-stone-800 font-bold text-sm">{s.time}</span></td>
                        <td className="table-td hidden sm:table-cell"><span className={`badge ${FORMAT_BADGE[s.format]||FORMAT_BADGE['2D']}`}>{s.format}</span></td>
                        <td className="table-td hidden md:table-cell"><span className="text-emerald-600 font-bold text-sm">₹{s.price}</span></td>
                        <td className="table-td text-right"><div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEdit(s)} className="btn-edit">Edit</button><button onClick={() => handleDelete(s.id)} className="btn-danger">Delete</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Show' : 'Create New Show'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Movie *</label><select className="input" value={form.movieId} onChange={set('movieId')} required><option value="">Select movie</option>{movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>
            <div><label className="label">Theater *</label><select className="input" value={form.theaterId} onChange={set('theaterId')} required><option value="">Select theater</option>{theaters.map(t => <option key={t.id} value={t.id}>{t.name} — {t.city}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Date *</label><input className="input" type="date" value={form.date} onChange={set('date')} required min={today} /></div>
              <div><label className="label">Time *</label><select className="input" value={form.time} onChange={set('time')} required><option value="">Select time</option>{TIMES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label">Format</label><select className="input" value={form.format} onChange={set('format')}>{FORMATS.map(f => <option key={f}>{f}</option>)}</select></div>
              <div><label className="label">Ticket Price (₹) *</label><input className="input" type="number" value={form.price} onChange={set('price')} required min="1" placeholder="280" /></div>
            </div>
            {!editing && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div><label className="label text-xs">Rows</label><input className="input" type="number" value={form.rows} onChange={set('rows')} min="1" max="26" /><p className="text-stone-400 text-xs mt-1">Total: {form.rows*form.seatsPerRow||0} seats</p></div>
                <div><label className="label text-xs">Seats per Row</label><input className="input" type="number" value={form.seatsPerRow} onChange={set('seatsPerRow')} min="1" max="20" /></div>
              </div>
            )}
            {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">{saving ? <><Spinner size="sm" />Saving…</> : editing ? 'Save Changes' : 'Create Show'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline px-5">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
