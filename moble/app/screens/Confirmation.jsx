import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import QRCode from 'react-native-qrcode-svg'
import api from '../api/axios'
import { Button, Card, Divider, Spinner, Badge } from '../components/UI'
import { Colors, Radius } from '../theme'

export default function Confirmation() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const [booking, setBooking] = useState(params.bookingData ? JSON.parse(params.bookingData) : null)
  const [loading, setLoading] = useState(!params.bookingData)

  useEffect(() => {
    if (!booking) {
      api.get(`/bookings/${params.bookingId}`).then(({ data }) => {
        setBooking(data.booking)
        setLoading(false)
      }).catch(() => { router.replace('/'); })
    }
  }, [])

  if (loading) return <View style={styles.center}><Spinner /></View>
  if (!booking) return null

  const { show, seats } = booking
  const seatLabels = seats.map((bs) => `${bs.seat.row}${bs.seat.number}`).join(', ')
  const qrValue    = JSON.stringify({ bookingId: booking.id, movie: show.movie?.title, seats: seatLabels })

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 56, marginBottom: 8 }}>🎉</Text>
        <Text style={styles.title}>BOOKING CONFIRMED</Text>
        <Text style={styles.subtitle}>Show QR at the theater entrance.</Text>
      </View>

      {/* Ticket card */}
      <Card style={styles.ticket}>
        {/* Red top stripe */}
        <View style={styles.stripe} />

        <View style={styles.ticketBody}>
          {/* Movie info */}
          <View style={styles.movieRow}>
            {show.movie?.poster && (
              // eslint-disable-next-line react-native/no-inline-styles
              <View style={{ width: 50, height: 72, borderRadius: 6, overflow: 'hidden', backgroundColor: '#222', marginRight: 12 }}>
                <View style={{ flex: 1 }} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.movieTitle}>{show.movie?.title?.toUpperCase()}</Text>
              <Text style={styles.movieMeta}>{show.movie?.genre}  ·  {show.movie?.language}  ·  {show.format}</Text>
            </View>
          </View>

          {/* Details grid */}
          <View style={styles.detailsGrid}>
            {[
              ['Theater',    show.theater?.name],
              ['City',       show.theater?.city],
              ['Date',       show.date],
              ['Time',       show.time],
              ['Seats',      seatLabels],
              ['Tickets',    `${seats.length} seat(s)`],
            ].map(([label, val]) => (
              <View key={label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailVal} numberOfLines={2}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount Paid</Text>
            <Text style={styles.amountVal}>₹{booking.totalAmount.toFixed(2)}</Text>
          </View>

          {/* Dashed divider */}
          <View style={styles.dashedDivider}>
            <View style={styles.notchLeft} />
            <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: Colors.cardBorder, borderStyle: 'dashed' }} />
            <View style={styles.notchRight} />
          </View>

          {/* QR Code */}
          <View style={styles.qrWrap}>
            <View style={styles.qrBox}>
              <QRCode value={qrValue} size={140} backgroundColor="white" color="black" />
            </View>
            <Text style={styles.bookingId}>Booking #{booking.id}</Text>
          </View>
        </View>
      </Card>

      {/* Notification mock */}
      <Card style={styles.notifCard}>
        <Text style={styles.notifTitle}>📨 Confirmation sent</Text>
        <Text style={styles.notifSub}>Ticket details sent via email, SMS & WhatsApp (simulated).</Text>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="My Bookings"   onPress={() => router.replace('/profile')} variant="outline" style={{ flex: 1 }} />
        <Button title="Book Another"  onPress={() => router.replace('/movies')}  style={{ flex: 1 }} />
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  center:    { flex: 1, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' },
  header:    { alignItems: 'center', paddingTop: 28, paddingBottom: 20 },
  title:     { color: Colors.white, fontSize: 28, fontWeight: '900', letterSpacing: 3 },
  subtitle:  { color: Colors.muted, fontSize: 13, marginTop: 4 },
  ticket:    { marginHorizontal: 16, marginBottom: 14, overflow: 'visible' },
  stripe:    { height: 5, backgroundColor: Colors.red },
  ticketBody: { padding: 16 },
  movieRow:  { flexDirection: 'row', marginBottom: 16 },
  movieTitle: { color: Colors.white, fontWeight: '800', fontSize: 16, letterSpacing: 0.5, marginBottom: 4 },
  movieMeta:  { color: Colors.muted, fontSize: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  detailItem: { width: '46%' },
  detailLabel: { color: Colors.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  detailVal:   { color: Colors.white, fontWeight: '600', fontSize: 13 },
  amountRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  amountLabel: { color: Colors.muted, fontSize: 13 },
  amountVal:   { color: Colors.red, fontWeight: '800', fontSize: 22 },
  dashedDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  notchLeft:   { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.dark, marginLeft: -16, marginRight: 4, borderWidth: 1, borderColor: Colors.cardBorder },
  notchRight:  { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.dark, marginRight: -16, marginLeft: 4, borderWidth: 1, borderColor: Colors.cardBorder },
  qrWrap:      { alignItems: 'center', gap: 8 },
  qrBox:       { backgroundColor: '#fff', padding: 10, borderRadius: Radius.md },
  bookingId:   { color: Colors.muted, fontSize: 11, fontFamily: 'monospace' },
  notifCard:   { marginHorizontal: 16, padding: 14, marginBottom: 14, backgroundColor: 'rgba(20,83,45,0.2)', borderColor: '#166534' },
  notifTitle:  { color: Colors.green, fontWeight: '700', fontSize: 14, marginBottom: 2 },
  notifSub:    { color: Colors.muted, fontSize: 12 },
  actions:     { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
})
