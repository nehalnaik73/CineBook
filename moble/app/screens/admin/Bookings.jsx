import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native'
import api from '../../api/axios'
import { Card, Badge, Spinner } from '../../components/UI'
import { Colors, Radius } from '../../theme'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  const fetchBookings = () => {
    api.get('/bookings/all').then(({ data }) => { setBookings(data); setLoading(false) })
  }
  useEffect(() => { fetchBookings() }, [])

  const handleCancel = (id) => {
    Alert.alert('Force Cancel', 'Cancel this booking?', [
      { text: 'No' },
      {
        text: 'Yes', style: 'destructive', onPress: async () => {
          try { await api.put(`/bookings/${id}/cancel`); fetchBookings() }
          catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed.') }
        }
      },
    ])
  }

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === 'all' || b.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.show?.movie?.title?.toLowerCase().includes(q) ||
      String(b.id).includes(q)
    return matchStatus && matchSearch
  })

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalAmount, 0)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>BOOKINGS</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{bookings.length}</Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: '#4ade80' }]}>{bookings.filter(b => b.status === 'confirmed').length}</Text>
          <Text style={styles.statLbl}>Confirmed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: '#facc15', fontSize: 16 }]}>₹{Math.round(totalRevenue).toLocaleString('en-IN')}</Text>
          <Text style={styles.statLbl}>Revenue</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search user, movie, ID…"
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {['all', 'confirmed', 'cancelled'].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <Spinner /> : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item: b }) => {
            const seatLabels = b.seats.map(bs => `${bs.seat.row}${bs.seat.number}`).join(', ')
            const isConfirmed = b.status === 'confirmed'
            return (
              <Card style={styles.bookingCard}>
                <View style={styles.bookingTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingMovie} numberOfLines={1}>{b.show?.movie?.title}</Text>
                    <Text style={styles.bookingMeta}>{b.show?.theater?.name}  ·  {b.show?.date}  ·  {b.show?.time}</Text>
                    <View style={styles.userRow}>
                      <Text style={styles.bookingUser}>👤 {b.user?.name}</Text>
                      <Text style={styles.bookingEmail}>{b.user?.email}</Text>
                    </View>
                    <Text style={styles.bookingSeats}>Seats: {seatLabels}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Badge
                      label={b.status}
                      color={isConfirmed ? '#14532d' : '#2d0a0a'}
                      textColor={isConfirmed ? '#4ade80' : '#f87171'}
                    />
                    <Text style={styles.amount}>₹{b.totalAmount.toFixed(2)}</Text>
                    <Text style={styles.bookingId}>#{b.id}</Text>
                  </View>
                </View>
                {isConfirmed && (
                  <TouchableOpacity onPress={() => handleCancel(b.id)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Force Cancel</Text>
                  </TouchableOpacity>
                )}
              </Card>
            )
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search || filter !== 'all' ? 'No bookings match your filters.' : 'No bookings yet.'}
            </Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.dark },
  header:       { padding: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  screenTitle:  { color: Colors.white, fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  statsRow:     { flexDirection: 'row', padding: 12, gap: 8 },
  statBox:      { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: Radius.md, padding: 10, alignItems: 'center' },
  statVal:      { color: Colors.white, fontWeight: '800', fontSize: 20 },
  statLbl:      { color: Colors.muted, fontSize: 11, marginTop: 2 },
  searchWrap:   { paddingHorizontal: 16, marginBottom: 8 },
  searchInput:  { backgroundColor: Colors.input, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10, color: Colors.white, fontSize: 14 },
  filterRow:    { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 4 },
  filterBtn:    { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  filterBtnActive: { backgroundColor: Colors.red, borderColor: Colors.red },
  filterText:   { color: Colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  filterTextActive: { color: Colors.white },
  bookingCard:  { padding: 12, marginBottom: 10 },
  bookingTop:   { flexDirection: 'row', gap: 10 },
  bookingMovie: { color: Colors.white, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  bookingMeta:  { color: Colors.muted, fontSize: 11, marginBottom: 4 },
  userRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  bookingUser:  { color: Colors.subtext, fontSize: 12, fontWeight: '600' },
  bookingEmail: { color: Colors.muted, fontSize: 11 },
  bookingSeats: { color: Colors.muted, fontSize: 11 },
  amount:       { color: Colors.red, fontWeight: '800', fontSize: 16 },
  bookingId:    { color: '#444', fontSize: 10, fontFamily: 'monospace' },
  cancelBtn:    { marginTop: 10, borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingTop: 8, alignItems: 'flex-end' },
  cancelBtnText: { color: Colors.red, fontSize: 12, fontWeight: '600' },
  empty:        { color: Colors.muted, textAlign: 'center', paddingTop: 40, fontSize: 14 },
})
