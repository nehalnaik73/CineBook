import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors, Radius } from '../theme'
import { Badge } from './UI'

const genreColors = {
  'Action':  { bg: '#431407', text: '#fb923c' },
  'Sci-Fi':  { bg: '#0c1a2e', text: '#60a5fa' },
  'Fantasy': { bg: '#1e1b4b', text: '#a78bfa' },
  'Romance': { bg: '#2d0a1e', text: '#f472b6' },
  'Horror':  { bg: '#2d0a0a', text: '#f87171' },
  'Comedy':  { bg: '#1c1a00', text: '#facc15' },
  'Drama':   { bg: '#052e16', text: '#4ade80' },
}

export default function MovieCard({ movie }) {
  const router = useRouter()
  const gc = genreColors[movie.genre] || { bg: Colors.cardBorder, text: Colors.subtext }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/screens/MovieDetail?id=${movie.id}`)}
      style={styles.container}
    >
      <View style={styles.poster}>
        {movie.poster ? (
          <Image
            source={{ uri: movie.poster }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderPoster}>
            <Text style={{ fontSize: 32 }}>🎬</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{movie.rating}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{movie.title}</Text>
        <View style={styles.meta}>
          <Badge label={movie.genre} color={gc.bg} textColor={gc.text} />
          <Text style={styles.lang}>{movie.language}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    width: '48%',
    marginBottom: 12,
  },
  poster: { aspectRatio: 2 / 3, backgroundColor: '#222' },
  image:  { width: '100%', height: '100%' },
  placeholderPoster: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ratingBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  ratingText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  info: { padding: 8 },
  title: { color: Colors.white, fontWeight: '600', fontSize: 12, marginBottom: 5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lang: { color: Colors.muted, fontSize: 10 },
})
