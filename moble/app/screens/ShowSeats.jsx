import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../api/axios'
import SeatGrid from '../components/SeatGrid'
import { Button, Card, Spinner } from '../components/UI'
import { Colors, Radius } from '../theme'

export default function ShowSeats() {
  const { showId, showData, movieData } = useLocalSearchParams()
  const router = useRouter()

  const show  = showData  ? JSON.parse(showData)  : null
  const movie = movieData ? JSON.parse(movieData) : null

  const [seats, setSeats]       = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get(`/seats/show/${showId}`).then(({ data }) => {
      setSeats(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [showId])

  const toggleSeat = (seatId) => {
    setSelected((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    )
  }

  const total = selected.length * (show?.price || 0)
  const selectedSeats = seats.filter((s) => selected.includes(s.id))
  const seatLabels = selectedSeats.map((s) => `${s.row}${s.number}`).join(', ')

  const handleProceed = () => {
    if (!selected.length) return
    router.push({
      pathname: '/screens/Payment',
      params: {
        showId,
        seatIds:   JSON.stringify(selected),
        showData,
        movieData,
        total:     String(total),
      },
    })
  }

  if (loading) return <View style={styles.center}><Spinner /></View>

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Show info */}
        {show && (
          <Card style={styles.infoCard}>
            <Text style={styles.movieTitle}>{movie?.title?.toUpperCase()}</Text>
            <Text style={styles.showMeta}>
              {show.theater?.name}  ·  {show.date}  ·  {show.time}
            </Text>
            <View style={styles.formatRow}>
              <View style={styles.formatBadge}>
                <Text style={styles.formatText}>{show.format}</Text>
              </View>
              <Text style={styles.priceLabel}>₹{show.price} / seat</Text>
            </View>
          </Card>
        )}

        {/* Seat grid */}
        <Card style={styles.gridCard}>
          <SeatGrid seats={seats} selected={selected} onToggle={toggleSeat} />
        </Card>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom summary bar */}
      <View style={styles.bottomBar}>
        <View style={styles.summaryLeft}>
          {selected.length > 0 ? (
            <>
              <Text style={styles.summaryCount}>{selected.length} seat{selected.length > 1 ? 's' : ''}</Text>
              <Text style={styles.summarySeats} numberOfLines={1}>{seatLabels}</Text>
            </>
          ) : (
            <Text style={styles.summaryHint}>Select seats to continue</Text>
          )}
        </View>
        <View style={styles.summaryRight}>
          {selected.length > 0 && (
            <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>
          )}
          <Button
            title="Pay →"
            onPress={handleProceed}
            disabled={!selected.length}
            style={{ paddingHorizontal: 20, paddingVertical: 10 }}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  center: { flex: 1, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  infoCard: { margin: 16, padding: 14 },
  movieTitle: { color: Colors.white, fontSize: 18, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  showMeta: { color: Colors.muted, fontSize: 12, marginBottom: 8 },
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  formatBadge: { backgroundColor: '#1e3a5f', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  formatText: { color: '#60a5fa', fontSize: 11, fontWeight: '700' },
  priceLabel: { color: Colors.subtext, fontSize: 12 },
  gridCard: { marginHorizontal: 16, padding: 16, marginBottom: 12 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLeft: { flex: 1, marginRight: 12 },
  summaryCount: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  summarySeats: { color: Colors.muted, fontSize: 11, marginTop: 2 },
  summaryHint: { color: Colors.muted, fontSize: 13 },
  summaryRight: { alignItems: 'flex-end' },
  totalLabel: { color: Colors.muted, fontSize: 10 },
  totalAmount: { color: Colors.white, fontWeight: '800', fontSize: 20 },
})
