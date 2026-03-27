import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import api from '../../api/axios'
import { Button, Input, Card, Badge, Spinner, ErrorBox, Divider } from '../../components/UI'
import { Colors, Radius } from '../../theme'

const EMPTY = { title: '', description: '', genre: '', language: '', duration: '', rating: 'UA', poster: '', releaseDate: '' }
const GENRES = ['Action','Comedy','Drama','Fantasy','Horror','Romance','Sci-Fi','Thriller']
const LANGS  = ['English','Hindi','Telugu','Tamil','Malayalam','Kannada']
const RATINGS = ['U','UA','A','S']

export default function AdminMovies() {
  const [movies, setMovies]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const fetch = () => api.get('/movies?limit=100').then(({ data }) => { setMovies(data.movies); setLoading(false) })
  useEffect(() => { fetch() }, [])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title || !form.genre || !form.language || !form.duration || !form.releaseDate) {
      return setError('Please fill all required fields.')
    }
    setError(''); setSaving(true)
    try {
      editing ? await api.put(`/movies/${editing}`, form) : await api.post('/movies', form)
      fetch(); setForm(EMPTY); setEditing(null); setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  const handleEdit = (m) => {
    setEditing(m.id)
    setForm({ title: m.title, description: m.description, genre: m.genre, language: m.language, duration: String(m.duration), rating: m.rating, poster: m.poster || '', releaseDate: m.releaseDate })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    Alert.alert('Deactivate Movie', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => { await api.delete(`/movies/${id}`); fetch() } },
    ])
  }

  const handleCancel = () => { setForm(EMPTY); setEditing(null); setShowForm(false); setError('') }

  const PillPicker = ({ label, options, value, onSelect }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {options.map((o) => (
          <TouchableOpacity key={o} onPress={() => onSelect(o)} style={[styles.pill, value === o && styles.pillActive]}>
            <Text style={[styles.pillText, value === o && styles.pillTextActive]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>MOVIES</Text>
        <TouchableOpacity onPress={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY) }} style={styles.addBtn}>
          <Text style={styles.addBtnText}>{showForm ? '✕ Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{editing ? 'Edit Movie' : 'Add Movie'}</Text>
            <Divider />
            <ErrorBox message={error} />
            <Input label="Title *"       value={form.title}       onChangeText={set('title')}       placeholder="Movie title" />
            <Input label="Description *" value={form.description} onChangeText={set('description')} placeholder="Synopsis" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
            <PillPicker label="Genre *"    options={GENRES}  value={form.genre}    onSelect={set('genre')} />
            <PillPicker label="Language *" options={LANGS}   value={form.language} onSelect={set('language')} />
            <PillPicker label="Rating *"   options={RATINGS} value={form.rating}   onSelect={set('rating')} />
            <Input label="Duration (mins) *" value={form.duration}    onChangeText={set('duration')}    keyboardType="number-pad" placeholder="e.g. 150" />
            <Input label="Release Date *"    value={form.releaseDate} onChangeText={set('releaseDate')} placeholder="YYYY-MM-DD" />
            <Input label="Poster URL"        value={form.poster}      onChangeText={set('poster')}      placeholder="https://..." autoCapitalize="none" />
            <Button title={saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Movie'} onPress={handleSave} disabled={saving} />
            <TouchableOpacity onPress={handleCancel} style={styles.cancelLink}>
              <Text style={{ color: Colors.muted, textAlign: 'center', fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      )}

      {!showForm && (
        loading ? <Spinner /> : (
          <FlatList
            data={movies}
            keyExtractor={(m) => String(m.id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item: m }) => (
              <Card style={styles.movieRow}>
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle} numberOfLines={1}>{m.title}</Text>
                  <View style={styles.movieMeta}>
                    <Badge label={m.genre}    color="#1a1a1a" textColor={Colors.subtext} />
                    <Badge label={m.language} color="#1a1a1a" textColor={Colors.subtext} />
                    <Badge label={m.isActive ? 'Active' : 'Off'} color={m.isActive ? '#14532d' : '#2d0a0a'} textColor={m.isActive ? '#4ade80' : '#f87171'} />
                  </View>
                  <Text style={styles.movieSub}>{m.duration}m · {m.rating} · {m.releaseDate}</Text>
                </View>
                <View style={styles.movieActions}>
                  <TouchableOpacity onPress={() => handleEdit(m)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(m.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>Del</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No movies found.</Text>}
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
  formScroll:  { flex: 1 },
  formCard:    { margin: 16, padding: 16 },
  formTitle:   { color: Colors.white, fontWeight: '800', fontSize: 18, marginBottom: 4 },
  fieldLabel:  { color: Colors.muted, fontSize: 13, marginBottom: 6 },
  pill:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#1f1f1f', borderWidth: 1, borderColor: Colors.cardBorder },
  pillActive:  { backgroundColor: Colors.red, borderColor: Colors.red },
  pillText:    { color: Colors.muted, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: Colors.white },
  cancelLink:  { marginTop: 10 },
  movieRow:    { padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  movieInfo:   { flex: 1 },
  movieTitle:  { color: Colors.white, fontWeight: '700', fontSize: 14, marginBottom: 5 },
  movieMeta:   { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 4 },
  movieSub:    { color: Colors.muted, fontSize: 11 },
  movieActions: { gap: 6 },
  editBtn:     { backgroundColor: '#1e3a5f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#60a5fa', fontWeight: '700', fontSize: 12 },
  deleteBtn:   { backgroundColor: '#2d0a0a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
  empty:       { color: Colors.muted, textAlign: 'center', paddingTop: 40 },
})
