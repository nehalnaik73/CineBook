import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Spinner, SkeletonRow } from '../../components/Loader'

const EMPTY = { title:'', description:'', genre:'', language:'', duration:'', rating:'UA', poster:'', releaseDate:'' }
const GENRES = ['Action','Adventure','Animation','Comedy','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller']
const LANGUAGES = ['English','Hindi','Telugu','Tamil','Malayalam','Kannada','Punjabi','Bengali']
const RATINGS = ['U','UA','A','S']

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-stone-800 font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchMovies = () => api.get('/movies?limit=200').then(({ data }) => { setMovies(data.movies); setLoading(false) })
  useEffect(() => { fetchMovies() }, [])
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowModal(true) }
  const openEdit = (m) => { setEditing(m.id); setForm({ title:m.title, description:m.description, genre:m.genre, language:m.language, duration:m.duration, rating:m.rating, poster:m.poster||'', releaseDate:m.releaseDate?.split('T')[0]||'' }); setError(''); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try { editing ? await api.put(`/movies/${editing}`, form) : await api.post('/movies', form); fetchMovies(); setShowModal(false) }
    catch (err) { setError(err.response?.data?.message || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this movie?')) return
    try { await api.delete(`/movies/${id}`); fetchMovies() } catch { alert('Failed.') }
  }

  const filtered = movies.filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.genre?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-1">Admin / Manage</p>
          <h1 className="font-display text-5xl text-stone-900 font-bold">Movies</h1>
          <p className="text-stone-400 text-sm mt-1">{movies.length} total movies</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">+ Add Movie</button>
      </div>

      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input className="input pl-11" placeholder="Search by title or genre…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="table-th">Movie</th>
                <th className="table-th">Genre</th>
                <th className="table-th hidden md:table-cell">Language</th>
                <th className="table-th hidden lg:table-cell">Duration</th>
                <th className="table-th">Rating</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? Array(6).fill(0).map((_,i) => <SkeletonRow key={i} />) : filtered.map(m => (
                <tr key={m.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      {m.poster ? <img src={m.poster} alt="" className="w-8 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display='none'} /> : <div className="w-8 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-xs flex-shrink-0">🎬</div>}
                      <div>
                        <p className="text-stone-800 font-semibold text-sm">{m.title}</p>
                        <p className="text-stone-400 text-xs">{m.releaseDate?.split('T')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-stone-500">{m.genre}</td>
                  <td className="table-td text-stone-500 hidden md:table-cell">{m.language}</td>
                  <td className="table-td text-stone-500 hidden lg:table-cell">{m.duration}m</td>
                  <td className="table-td"><span className="badge bg-stone-100 text-stone-600">{m.rating}</span></td>
                  <td className="table-td"><span className={`badge ${m.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="table-td text-right">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(m)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center"><div className="text-4xl mb-3">🎬</div><p className="text-stone-400 text-sm">{search ? 'No movies match.' : 'No movies yet.'}</p>{!search && <button onClick={openAdd} className="btn-primary mt-4 text-sm">Add First Movie</button>}</div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Movie' : 'Add New Movie'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Title *</label><input className="input" value={form.title} onChange={set('title')} required placeholder="Movie title" /></div>
            <div><label className="label">Description *</label><textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} required placeholder="Synopsis…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Genre *</label><select className="input" value={form.genre} onChange={set('genre')} required><option value="">Select</option>{GENRES.map(g => <option key={g}>{g}</option>)}</select></div>
              <div><label className="label">Language *</label><select className="input" value={form.language} onChange={set('language')} required><option value="">Select</option>{LANGUAGES.map(l => <option key={l}>{l}</option>)}</select></div>
              <div><label className="label">Duration (mins)</label><input className="input" type="number" value={form.duration} onChange={set('duration')} required min="1" placeholder="120" /></div>
              <div><label className="label">Rating</label><select className="input" value={form.rating} onChange={set('rating')}>{RATINGS.map(r => <option key={r}>{r}</option>)}</select></div>
              <div><label className="label">Release Date</label><input className="input" type="date" value={form.releaseDate} onChange={set('releaseDate')} required /></div>
              <div><label className="label">Poster URL</label><input className="input" value={form.poster} onChange={set('poster')} placeholder="https://…" /></div>
            </div>
            {form.poster && <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100"><img src={form.poster} alt="" className="w-10 h-14 rounded-lg object-cover" onError={e => e.target.style.opacity='0.3'} /><p className="text-stone-400 text-xs">Poster preview</p></div>}
            {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">{saving ? <><Spinner size="sm" />Saving…</> : editing ? 'Save Changes' : 'Add Movie'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline px-5">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
