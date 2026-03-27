import { useEffect, useState } from 'react'
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import api from '../api/axios'
import MovieCard from '../components/MovieCard'
import { Spinner, SectionTitle } from '../components/UI'
import { Colors, Radius } from '../theme'

export default function Home() {
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/movies?limit=8').then(({ data }) => {
      setMovies(data.movies)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['#2d0a0a', '#0D0D0D']}
        style={styles.hero}
      >
        <Text style={styles.heroTag}>Your Ultimate Booking Destination</Text>
        <Text style={styles.heroTitle}>CINE<Text style={{ color: Colors.red }}>BOOK</Text></Text>
        <Text style={styles.heroSub}>Book tickets for the latest blockbusters. Choose your seats. Enjoy the show.</Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.heroBtnPrimary} onPress={() => router.push('/movies')}>
            <Text style={styles.heroBtnText}>Browse Movies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtnOutline} onPress={() => router.push('/screens/Register')}>
            <Text style={[styles.heroBtnText, { color: Colors.white }]}>Join Free</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Now Showing */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <SectionTitle>NOW SHOWING</SectionTitle>
            <Text style={styles.sectionSub}>Catch the latest releases</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/movies')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {loading ? <Spinner /> : (
          <View style={styles.grid}>
            {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
          </View>
        )}
      </View>

      {/* Features */}
      <View style={styles.features}>
        {[
          { icon: '🎟️', title: 'Easy Booking',    desc: 'Book in seconds with seamless checkout.' },
          { icon: '💺', title: 'Seat Selection',  desc: 'Pick your perfect seat interactively.' },
          { icon: '📱', title: 'Digital Tickets', desc: 'QR-coded tickets instantly on your device.' },
        ].map((f) => (
          <View key={f.title} style={styles.featureCard}>
            <Text style={{ fontSize: 28, marginBottom: 6 }}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  hero: { padding: 24, paddingTop: 32, paddingBottom: 36 },
  heroTag: { color: Colors.red, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { color: Colors.white, fontSize: 52, fontWeight: '900', letterSpacing: 4, lineHeight: 56 },
  heroSub: { color: Colors.subtext, fontSize: 14, marginTop: 10, marginBottom: 20, lineHeight: 20 },
  heroButtons: { flexDirection: 'row', gap: 10 },
  heroBtnPrimary: { backgroundColor: Colors.red, paddingVertical: 12, paddingHorizontal: 22, borderRadius: Radius.md },
  heroBtnOutline: { borderWidth: 1, borderColor: Colors.cardBorder, paddingVertical: 12, paddingHorizontal: 22, borderRadius: Radius.md },
  heroBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sectionSub: { color: Colors.muted, fontSize: 12, marginTop: 2 },
  viewAll: { color: Colors.red, fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  features: { paddingHorizontal: 20, paddingBottom: 10, gap: 10 },
  featureCard: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: Radius.lg, padding: 16, marginBottom: 8,
  },
  featureTitle: { color: Colors.white, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  featureDesc: { color: Colors.muted, fontSize: 13, lineHeight: 18 },
})
