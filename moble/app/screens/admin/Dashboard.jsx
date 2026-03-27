import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import api from '../../api/axios'
import { Spinner, Card } from '../../components/UI'
import { Colors, Radius } from '../../theme'

function StatCard({ label, value, icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value ?? '—'}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statManage}>Manage →</Text>
    </TouchableOpacity>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats]   = useState({ movies: 0, theaters: 0, shows: 0, bookings: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/movies?limit=1'),
      api.get('/theaters'),
      api.get('/shows'),
      api.get('/bookings/all'),
    ]).then(([m, t, s, b]) => {
      const revenue = b.data
        .filter((bk) => bk.status === 'confirmed')
        .reduce((sum, bk) => sum + bk.totalAmount, 0)
      setStats({ movies: m.data.total, theaters: t.data.length, shows: s.data.length, bookings: b.data.length, revenue })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <View style={styles.center}><Spinner /></View>

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.tagline}>Admin Panel</Text>
        <Text style={styles.title}>DASHBOARD</Text>
      </View>

      {/* Stat grid */}
      <View style={styles.statGrid}>
        <StatCard label="Movies"   value={stats.movies}   icon="🎬" onPress={() => router.push('/screens/admin/Movies')} />
        <StatCard label="Theaters" value={stats.theaters} icon="🏛️" onPress={() => router.push('/screens/admin/Theaters')} />
        <StatCard label="Shows"    value={stats.shows}    icon="📅" onPress={() => router.push('/screens/admin/Shows')} />
        <StatCard label="Bookings" value={stats.bookings} icon="🎟️" onPress={() => router.push('/screens/admin/Bookings')} />
      </View>

      {/* Revenue */}
      <Card style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Total Revenue (confirmed)</Text>
        <Text style={styles.revenueAmount}>
          ₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      </Card>

      {/* Quick links */}
      <View style={styles.quickLinks}>
        {[
          { label: '➕  Add Movie',    route: '/screens/admin/Movies' },
          { label: '🏗️  Add Theater',  route: '/screens/admin/Theaters' },
          { label: '🎞️  Create Show',  route: '/screens/admin/Shows' },
          { label: '📋  All Bookings', route: '/screens/admin/Bookings' },
        ].map((l) => (
          <TouchableOpacity key={l.label} onPress={() => router.push(l.route)} style={styles.quickBtn}>
            <Text style={styles.quickBtnText}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.dark },
  center:     { flex: 1, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  header:     { padding: 20, paddingBottom: 12 },
  tagline:    { color: Colors.red, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  title:      { color: Colors.white, fontSize: 36, fontWeight: '900', letterSpacing: 3 },
  statGrid:   { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 14 },
  statCard: {
    width: '47%', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: Radius.lg, padding: 14,
  },
  statTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  statIcon:   { fontSize: 22 },
  statValue:  { color: Colors.white, fontSize: 28, fontWeight: '800' },
  statLabel:  { color: Colors.muted, fontSize: 12, marginBottom: 6 },
  statManage: { color: Colors.red, fontSize: 11, fontWeight: '700' },
  revenueCard: { marginHorizontal: 16, padding: 16, marginBottom: 14 },
  revenueLabel:  { color: Colors.muted, fontSize: 12, marginBottom: 4 },
  revenueAmount: { color: '#4ade80', fontSize: 28, fontWeight: '800' },
  quickLinks: { paddingHorizontal: 16, gap: 8 },
  quickBtn: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: Radius.md, padding: 14,
  },
  quickBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
})
