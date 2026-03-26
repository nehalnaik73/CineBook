import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Spinner, SkeletonRow } from '../../components/Loader'

const EMPTY = { name:'', city:'', address:'' }
const CITIES = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Surat','Lucknow','Kanpur']

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-6"><h2 className="text-stone-800 font-bold text-lg">{title}</h2><button onClick={onClose} className="text-stone-400 hover:text-stone-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100">✕</button></div>
        {children}
      </div>
    </div>
  )
}

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchData = () => api.get('/theaters').then(({ data }) => { setTheaters(data); setLoading(false) })
  useEffect(() => { fetchData() }, [])
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowModal(true) }
  const openEdit = (t) => { setEditing(t.id); setForm({ name:t.name, city:t.city, address:t.address }); setError(''); setShowModal(true) }
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try { editing ? await api.put(`/theaters/${editing}`, form) : await api.post('/theaters', form); fetchData(); setShowModal(false) }
    catch (err) { setError(err.response?.data?.message || 'Save failed.') }
    finally { setSaving(false) }
  }
  const handleDelete = async (id) => { if (!confirm('Delete this theater?')) return; try { await api.delete(`/theaters/${id}`); fetchData() } catch { alert('Failed.') } }

  const byCity = theaters.reduce((acc, t) => { (acc[t.city]=acc[t.city]||[]).push(t); return acc }, {})

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-1">Admin / Manage</p>
          <h1 className="font-display text-5xl text-stone-900 font-bold">Theaters</h1>
          <p className="text-stone-400 text-sm mt-1">{theaters.length} venues registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">+ Add Theater</button>
      </div>

      {loading ? <div className="card"><table className="w-full"><tbody>{Array(4).fill(0).map((_,i) => <SkeletonRow key={i} />)}</tbody></table></div>
      : theaters.length === 0 ? <div className="card py-20 text-center"><div className="text-5xl mb-4">🏛️</div><p className="text-stone-400 mb-4">No theaters yet.</p><button onClick={openAdd} className="btn-primary">Add First Theater</button></div>
      : (
        <div className="space-y-6">
          {Object.entries(byCity).map(([city, cts]) => (
            <div key={city}>
              <div className="flex items-center gap-3 mb-3">
                <span className="badge bg-blue-100 text-blue-700 text-xs px-3">{city}</span>
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-stone-400 text-xs">{cts.length} theater{cts.length!==1?'s':''}</span>
              </div>
              <div className="card overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="border-b border-stone-100 bg-stone-50"><tr><th className="table-th">Name</th><th className="table-th hidden md:table-cell">Address</th><th className="table-th text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-stone-50">
                    {cts.map(t => (
                      <tr key={t.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="table-td"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">🏛️</div><div><p className="text-stone-800 font-semibold text-sm">{t.name}</p><p className="text-stone-400 text-xs">ID: {t.id}</p></div></div></td>
                        <td className="table-td text-stone-500 text-sm hidden md:table-cell">{t.address}</td>
                        <td className="table-td text-right"><div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEdit(t)} className="btn-edit">Edit</button><button onClick={() => handleDelete(t.id)} className="btn-danger">Delete</button></div></td>
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
        <Modal title={editing ? 'Edit Theater' : 'Add Theater'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Theater Name *</label><input className="input" value={form.name} onChange={set('name')} required placeholder="e.g. PVR Cinemas – Forum Mall" /></div>
            <div><label className="label">City *</label><select className="input" value={form.city} onChange={set('city')} required><option value="">Select city</option>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">Address *</label><input className="input" value={form.address} onChange={set('address')} required placeholder="Mall / Area, Landmark" /></div>
            {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">{saving ? <><Spinner size="sm" />Saving…</> : editing ? 'Save Changes' : 'Add Theater'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-outline px-5">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
