import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Badge, Spinner, Card } from '../components/UI'
import { Colors, Radius } from '../theme'

const fmtColor = { '2D': { bg: '#1f2937', txt: '#9ca3af' }, '3D': { bg: '#1e3a5f', txt: '#60a5fa' }, 'IMAX': { bg: '#2d1b69', txt: '#a78bfa' } }

export default function MovieDetail() {
  const { id }    = useLocalSearchParams()
  const router    = useRouter()
  const { user }  = useAuth()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [cities, setCities] = useState([])
  const [city, setCity]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/movies/${id}`).then(({ data }) => { setMovie(data); setLoading(false) })
    api.get('/theaters/cities').then(({ data }) => setCities(data))
  }, [id])

  useEffect(() => {
    const params = new URLSearchParams({ movieId: id })
    if (city) params.set('city', city)
    api.get(`/shows?${params}`).then(({ data }) => setShows(data))
  }, [id, city])

  const handleBook = (show) => {
    if (!user) return router.push('/screens/Login')
    router.push({ pathname: '/screens/ShowSeats', params: { showId: show.id, showData: JSON.stringify(show), movieData: JSON.stringify(movie) } })
  }

  if (loading) return <View style={styles.loadingContainer}><Spinner /></View>
  if (!movie)  return <View style={styles.loadingContainer}><Text style={{ color: Colors.muted }}>Movie not found.</Text></View>

  // Group shows: date → theater
  const grouped = shows.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = {}
    if (!acc[s.date][s.theater.name]) acc[s.date][s.theater.name] = []
    acc[s.date][s.theater.name].push(s)
    return acc
  }, {})

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        {movie.poster && <Image source={{ uri: movie.poster }} style={styles.poster} resizeMode="cover" />}
        <View style={styles.heroInfo}>
          <Text style={styles.title}>{movie.title.toUpperCase()}</Text>
          <View style={styles.badges}>
            <Badge label={movie.genre}    color="#431407" textColor="#fb923c" />
            <Badge label={movie.language} color={Colors.cardBorder} textColor={Colors.muted} />
            <Badge label={movie.rating}   color={Colors.cardBorder} textColor={Colors.muted} />
            <Badge label={`${movie.duration}m`} color={Colors.cardBorder} textColor={Colors.muted} />
          </View>
          <Text style={styles.desc} numberOfLines={4}>{movie.description}</Text>
          <Text style={styles.releaseDate}>Release: {movie.releaseDate}</Text>
        </View>
      </View>

      {/* City filter */}
      <View style={styles.showsHeader}>
        <Text style={styles.showsTitle}>SHOWTIMES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <TouchableOpacity onPress={() => setCity('')} style={[styles.cityPill, !city && styles.cityPillActive]}>
            <Text style={[styles.cityPillText, !city && styles.cityPillTextActive]}>All</Text>
          </TouchableOpacity>
          {cities.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCity(c)} style={[styles.cityPill, city === c && styles.cityPillActive]}>
              <Text style={[styles.cityPillText, city === c && styles.cityPillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Shows */}
      {Object.keys(grouped).length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📅</Text>
          <Text style={{ color: Colors.muted }}>No shows available{city ? ` in ${city}` : ''}.</Text>
        </View>
      ) : (
        <View style={styles.showsContainer}>
          {Object.entries(grouped).map(([date, theaters]) => (
            <View key={date} style={{ marginBottom: 20 }}>
              <Text style={styles.dateLabel}>
                {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
              {Object.entries(theaters).map(([tName, tShows]) => (
                <Card key={tName} style={styles.theaterCard}>
                  <Text style={styles.theaterName}>{tName}</Text>
                  <Text style={styles.theaterAddr}>{tShows[0].theater.city} · {tShows[0].theater.address}</Text>
                  <View style={styles.showTimes}>
                    {tShows.map((show) => {
                      const fc = fmtColor[show.format] || fmtColor['2D']
                      return (
                        <TouchableOpacity key={show.id} onPress={() => handleBook(show)} style={styles.showBtn}>
                          <Text style={styles.showTime}>{show.time}</Text>
                          <View style={[styles.formatTag, { backgroundColor: fc.bg }]}>
                            <Text style={[styles.formatText, { color: fc.txt }]}>{show.format}</Text>
                          </View>
                          <Text style={styles.showPrice}>₹{show.price}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </Card>
              ))}
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  loadingContainer: { flex: 1, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  poster: { width: 100, height: 150, borderRadius: Radius.md },
  heroInfo: { flex: 1 },
  title: { color: Colors.white, fontSize: 18, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  desc: { color: Colors.subtext, fontSize: 12, lineHeight: 18, marginBottom: 6 },
  releaseDate: { color: Colors.muted, fontSize: 11 },
  showsHeader: { padding: 16, paddingBottom: 8 },
  showsTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  cityPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  cityPillActive: { backgroundColor: Colors.red, borderColor: Colors.red },
  cityPillText: { color: Colors.muted, fontSize: 12, fontWeight: '600' },
  cityPillTextActive: { color: Colors.white },
  showsContainer: { padding: 16 },
  dateLabel: { color: Colors.white, fontWeight: '700', fontSize: 14, marginBottom: 8 },
  theaterCard: { padding: 12, marginBottom: 10 },
  theaterName: { color: Colors.white, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  theaterAddr: { color: Colors.muted, fontSize: 11, marginBottom: 10 },
  showTimes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  showBtn: {
    borderWidth: 1, borderColor: '#166534', backgroundColor: 'rgba(20,83,45,0.2)',
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', gap: 4,
  },
  showTime: { color: '#4ade80', fontWeight: '700', fontSize: 13 },
  formatTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  formatText: { fontSize: 10, fontWeight: '700' },
  showPrice: { color: Colors.muted, fontSize: 11 },
  empty: { alignItems: 'center', paddingTop: 40, paddingBottom: 24 },
})
