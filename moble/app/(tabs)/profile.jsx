import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { Button, Input, Card, Badge, Spinner, Divider, ErrorBox } from '../components/UI'
import { Colors, Radius } from '../theme'

function BookingItem({ booking, onCancel }) {
  const { show, seats } = booking
  const seatLabels = seats.map((bs) => `${bs.seat.row}${bs.seat.number}`).join(', ')
  const isConfirmed = booking.status === 'confirmed'

  return (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookingMovie}>{show.movie?.title}</Text>
          <Text style={styles.bookingMeta}>{show.theater?.name} · {show.theater?.city}</Text>
          <Text style={styles.bookingMeta}>{show.date} · {show.time} · {show.format}</Text>
          <Text style={styles.bookingSeats}>Seats: {seatLabels}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Badge
            label={booking.status}
            color={isConfirmed ? '#14532d' : '#2d0a0a'}
            textColor={isConfirmed ? '#4ade80' : '#f87171'}
          />
          <Text style={styles.bookingAmount}>₹{booking.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      <Divider />
      <View style={styles.bookingActions}>
        {isConfirmed && (
          <TouchableOpacity onPress={() => onCancel(booking.id)}>
            <Text style={{ color: Colors.red, fontSize: 12 }}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.bookingId}>#{booking.id}</Text>
      </View>
    </Card>
  )
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(false)
  const [tab, setTab]           = useState('bookings')
  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api.get('/bookings/my').then(({ data }) => { setBookings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <View style={styles.loginPrompt}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🎬</Text>
        <Text style={styles.loginTitle}>Sign in to CineBook</Text>
        <Text style={styles.loginSub}>Access your bookings, profile, and more.</Text>
        <Button title="Sign In" onPress={() => router.push('/screens/Login')} style={{ marginBottom: 10, marginTop: 20 }} />
        <Button title="Create Account" variant="outline" onPress={() => router.push('/screens/Register')} />
      </View>
    )
  }

  const handleCancel = (id) => {
    Alert.alert('Cancel Booking', 'Are you sure? A refund will be initiated.', [
      { text: 'No' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await api.put(`/bookings/${id}/cancel`)
            setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b))
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Cancel failed.')
          }
        }
      },
    ])
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const { data } = await api.put('/auth/profile', form)
      await updateUser(data)
      Alert.alert('Saved', 'Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.')
    } finally { setSaving(false) }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ])
  }

  const confirmed = bookings.filter((b) => b.status === 'confirmed')
  const cancelled = bookings.filter((b) => b.status === 'cancelled')

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.role === 'admin' && (
            <TouchableOpacity onPress={() => router.push('/screens/admin/Dashboard')} style={styles.adminBtn}>
              <Text style={styles.adminBtnText}>⚙️ Admin Panel →</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: Colors.red, fontSize: 13, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['bookings', 'profile'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'bookings' ? `My Bookings (${bookings.length})` : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings */}
      {tab === 'bookings' && (
        <View style={styles.section}>
          {loading ? <Spinner /> : bookings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🎟️</Text>
              <Text style={{ color: Colors.muted, marginBottom: 16 }}>No bookings yet.</Text>
              <Button title="Browse Movies" onPress={() => router.push('/movies')} />
            </View>
          ) : (
            <>
              {confirmed.length > 0 && (
                <>
                  <Text style={styles.groupLabel}>ACTIVE ({confirmed.length})</Text>
                  {confirmed.map((b) => <BookingItem key={b.id} booking={b} onCancel={handleCancel} />)}
                </>
              )}
              {cancelled.length > 0 && (
                <>
                  <Text style={styles.groupLabel}>CANCELLED ({cancelled.length})</Text>
                  {cancelled.map((b) => <BookingItem key={b.id} booking={b} onCancel={() => {}} />)}
                </>
              )}
            </>
          )}
        </View>
      )}

      {/* Edit Profile */}
      {tab === 'profile' && (
        <View style={styles.section}>
          <ErrorBox message={error} />
          <Input label="Full Name" value={form.name} onChangeText={(t) => setForm((f) => ({ ...f, name: t }))} />
          <Input label="Email" value={user.email} editable={false} style={{ opacity: 0.5 }} />
          <Input label="Phone" value={form.phone} onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))} keyboardType="phone-pad" />
          <Button title={saving ? 'Saving…' : 'Save Changes'} onPress={handleSave} disabled={saving} />
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  loginPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: 80 },
  loginTitle: { color: Colors.white, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  loginSub: { color: Colors.muted, fontSize: 14, textAlign: 'center', marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  userName: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  userEmail: { color: Colors.muted, fontSize: 13 },
  adminBtn: { marginTop: 4 },
  adminBtnText: { color: Colors.red, fontSize: 12, fontWeight: '600' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#111', borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: Radius.lg, padding: 4, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.red },
  tabText: { color: Colors.muted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: Colors.white },
  section: { padding: 16 },
  groupLabel: { color: Colors.muted, fontSize: 10, letterSpacing: 2, marginBottom: 8, marginTop: 4 },
  bookingCard: { marginBottom: 10, padding: 12 },
  bookingHeader: { flexDirection: 'row', gap: 10 },
  bookingMovie: { color: Colors.white, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  bookingMeta: { color: Colors.muted, fontSize: 12 },
  bookingSeats: { color: Colors.subtext, fontSize: 12, marginTop: 2 },
  bookingAmount: { color: Colors.red, fontWeight: '700', fontSize: 16 },
  bookingActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingId: { color: '#444', fontSize: 11, fontFamily: 'monospace' },
  empty: { alignItems: 'center', paddingTop: 40 },
})
