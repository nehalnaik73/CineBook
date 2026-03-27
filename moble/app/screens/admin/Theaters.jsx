import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import api from '../../api/axios'
import { Button, Input, Card, Badge, Spinner, ErrorBox, Divider } from '../../components/UI'
import { Colors, Radius } from '../../theme'

const EMPTY = { name: '', city: '', address: '' }
const CITIES = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad']

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const fetch = () => api.get('/theaters').then(({ data }) => { setTheaters(data); setLoading(false) })
  useEffect(() => { fetch() }, [])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.city || !form.address) return setError('All fields are required.')
    setError(''); setSaving(true)
    try {
      editing ? await api.put(`/theaters/${editing}`, form) : await api.post('/theaters', form)
      fetch(); setForm(EMPTY); setEditing(null); setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  const handleEdit = (t) => {
    setEditing(t.id); setForm({ name: t.name, city: t.city, address: t.address }); setShowForm(true)
  }

  const handleDelete = (id) => {
    Alert.alert('Delete Theater', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/theaters/${id}`); fetch() } },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>THEATERS</Text>
        <TouchableOpacity onPress={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY) }} style={styles.addBtn}>
          <Text style={styles.addBtnText}>{showForm ? '✕ Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{editing ? 'Edit Theater' : 'Add Theater'}</Text>
            <Divider />
            <ErrorBox message={error} />
            <Input label="Theater Name *" value={form.name}    onChangeText={set('name')}    placeholder="e.g. PVR Cinemas" />
            <Input label="Address *"      value={form.address} onChangeText={set('address')} placeholder="Mall name, Area" />
            <Text style={styles.fieldLabel}>City *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 14 }}>
              {CITIES.map((c) => (
                <TouchableOpacity key={c} onPress={() => set('city')(c)} style={[styles.pill, form.city === c && styles.pillActive]}>
                  <Text style={[styles.pillText, form.city === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title={saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Theater'} onPress={handleSave} disabled={saving} />
            <TouchableOpacity onPress={() => { setForm(EMPTY); setEditing(null); setShowForm(false); setError('') }} style={{ marginTop: 10 }}>
              <Text style={{ color: Colors.muted, textAlign: 'center', fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      )}

      {!showForm && (
        loading ? <Spinner /> : (
          <FlatList
            data={theaters}
            keyExtractor={(t) => String(t.id)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item: t }) => (
              <Card style={styles.theaterRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.theaterName}>{t.name}</Text>
                  <Text style={styles.theaterAddr}>{t.address}</Text>
                  <Badge label={t.city} color="#0c1a2e" textColor="#60a5fa" />
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(t)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(t.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>Del</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No theaters found.</Text>}
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
  pill:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: '#1f1f1f', borderWidth: 1, borderColor: Colors.cardBorder },
  pillActive:  { backgroundColor: Colors.red, borderColor: Colors.red },
  pillText:    { color: Colors.muted, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: Colors.white },
  theaterRow:  { padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  theaterName: { color: Colors.white, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  theaterAddr: { color: Colors.muted, fontSize: 12, marginBottom: 6 },
  actions:     { gap: 6 },
  editBtn:     { backgroundColor: '#1e3a5f', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#60a5fa', fontWeight: '700', fontSize: 12 },
  deleteBtn:   { backgroundColor: '#2d0a0a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: '#f87171', fontWeight: '700', fontSize: 12 },
  empty:       { color: Colors.muted, textAlign: 'center', paddingTop: 40 },
})
