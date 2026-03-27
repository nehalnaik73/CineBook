import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import api from '../../api/axios'
import { Button, Input, Card, Badge, Spinner, ErrorBox, Divider } from '../../components/UI'
import { Colors, Radius } from '../../theme'

const EMPTY = { movieId: '', theaterId: '', date: '', time: '', format: '2D', price: '', rows: '8', seatsPerRow: '10' }
const FORMATS = ['2D', '3D', 'IMAX']
const fmtColor = { '2D': { bg: '#1f2937', txt: '#9ca3af' }, '3D': { bg: '#1e3a5f', txt: '#60a5fa' }, 'IMAX': { bg: '#2d1b69', txt: '#a78bfa' } }

export default function AdminShows() {
  const [shows, setShows]       = useState([])
  const [movies, setMovies]     = useState([])
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const fetchShows = () => api.get('/shows').then(({ data }) => { setShows(data); setLoading(false) })
  useEffect(() => {
    fetchShows()
    api.get('/movies?limit=100').then(({ data }) => setMovies(data.movies))
    api.get('/theaters').then(({ data }) => setTheaters(data))
  }, [])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.movieId || !form.theaterId || !form.date || !form.time || !form.price) {
      return setError('All fields are required.')
    }
    setError(''); setSaving(true)
    try {
      editing ? await api.put(`/shows/${editing}`, form) : await api.post('/shows', form)
      fetchShows(); setForm(EMPTY); setEditing(null); setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  const handleEdit = (s) => {
    setEditing(s.id)
    setForm({ movieId: String(s.movieId), theaterId: String(s.theaterId), date: s.date, time: s.time, format: s.format, price: String(s.price), rows: '8', seatsPerRow: '10' })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    Alert.alert('Delete Show', 'This will delete all seats too. Continue?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/shows/${id}`); fetchShows() } },
    ])
  }

  const SelectPicker = ({ label, options, value, onSelect, labelKey = 'label', valKey = 'value' }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o[valKey]
          const l = typeof o === 'string' ? o : o[labelKey]
          return (
            <TouchableOpacity key={v} onPress={() => onSelect(String(v))} style={[styles.pill, value === String(v) && styles.pillActive]}>
              <Text style={[styles.pillText, value === String(v) && styles.pillTextActive]} numberOfLines={1}>{l}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>SHOWS</Text>
        <TouchableOpacity onPress={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY) }} style={styles.addBtn}>
          <Text style={styles.addBtnText}>{showForm ? '✕ Cancel' : '+ Create'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{editing ? 'Edit Show' : 'Create Show'}</Text>
            <Divider />
            <ErrorBox message={error} />
            <SelectPicker label="Movie *"   options={movies.map(m => ({ value: m.id, label: m.title }))} value={form.movieId}   onSelect={set('movieId')} />
            <SelectPicker label="Theater *" options={theaters.map(t => ({ value: t.id, label: `${t.name} (${t.city})` }))} value={form.theaterId} onSelect={set('theaterId')} />
            <SelectPicker label="Format *"  options={FORMATS} value={form.format} onSelect={set('format')} />
            <Input label="Date *"     value={form.date}  onChangeText={set('date')}  placeholder="YYYY-MM-DD" />
            <Input label="Time *"     value={form.time}  onChangeText={set('time')}  placeholder="e.g. 07:00 PM" />
            <Input label="Price (₹) *" value={form.price} onChangeText={set('price')} keyboardType="number-pad" placeholder="e.g. 300" />
            {!editing && (
              <>
                <Input label="Rows (A–?)"      value={form.rows}       onChangeText={set('rows')}       keyboardType="number-pad" placeholder="8" />
                <Input label="Seats per Row"   value={form.seatsPerRow} onChangeText={set('seatsPerRow')} keyboardType="number-pad" placeholder="10" />
              </>
            )}
            <Button title={saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Show'} onPress={handleSave} disabled={saving} />
            <TouchableOpacity onPress={() => { setForm(EMPTY); setEditing(null); setShowForm(false); setError('') }} style={{ marginTop: 10 }}>
              <Text style={{ color: Colors.muted, textAlign: 'center', fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      )}

      {!showForm && (
        loading ? <Spinner /> : (
          <FlatList
            data={shows}
            keyExtractor={(s) => String(s.id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item: s }) => {
              const fc = fmtColor[s.format] || fmtColor['2D']
              return (
                <Card style={styles.showRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.showMovie} numberOfLines={1}>{s.movie?.title}</Text>
                    <Text style={styles.showMeta}>{s.theater?.name} · {s.theater?.city}</Text>
                    <Text style={styles.showMeta}>{s.date}  ·  {s.time}</Text>
                    <View style={styles.showTags}>
                      <View style={[styles.fmtTag, { backgroundColor: fc.bg }]}>
                        <Text style={[styles.fmtText, { color: fc.txt }]}>{s.format}</Text>
                      </View>
                      <Text style={styles.showPrice}>₹{s.price}</Text>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleEdit(s)} style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(s.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Del</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )
            }}
            ListEmptyComponent={<Text style={styles.empty}>No shows found.</Text>}
          />
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.dark },
  topBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  screenTitle: { color: Colors.white, fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  addBtn:      { backgroundColor: Colors.red, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.md },
  addBtnText:  { color: Colors.white, fontWeight: '700', fontSize: 13 },
  formCard:    { margin: 16, padding: 16 },
  formTitle:   { color: Colors.white, fontWeight: '800', fontSize: 18, marginBottom: 4 },
  fieldLabel:  { color: Colors.muted, fontSize: 13, marginBottom: 6 },
  pill:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#1f1f1f', borderWidth: 1, borderColor: Colors.cardBorder, maxWidth: 160 },
  pillActive:  { backgroundColor: Colors.red, borderColor: Colors.red },
  pillText:    { color: Colors.muted, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: Colors.white },
  showRow:     { padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  showMovie:   { color: Colors.white, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  showMeta:    { color: Colors.muted, fontSize: 11, marginBottom: 2 },
  showTags:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  fmtTag:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  fmtText:     { fontSize: 11, fontWeight: '700' },
  showPrice:   { color: '#4ade80', fontWeight: '700', fontSize: 13 },
  actions:     { gap: 6 },
  editBtn:     { backgroundColor: '#1e3a5f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#60a5fa', fontWeight: '700', fontSize: 12 },
  deleteBtn:   { backgroundColor: '#2d0a0a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
  empty:       { color: Colors.muted, textAlign: 'center', paddingTop: 40 },
})
