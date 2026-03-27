import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import api from '../api/axios'
import { Button, Card, Input, ErrorBox, Divider } from '../components/UI'
import { Colors, Radius } from '../theme'

const METHODS = [
  { id: 'card',   label: 'Credit / Debit Card', icon: '💳' },
  { id: 'upi',    label: 'UPI',                 icon: '📱' },
  { id: 'wallet', label: 'Wallet',               icon: '👛' },
]

export default function Payment() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const showId  = params.showId
  const seatIds = JSON.parse(params.seatIds || '[]')
  const show    = params.showData  ? JSON.parse(params.showData)  : null
  const movie   = params.movieData ? JSON.parse(params.movieData) : null
  const total   = parseFloat(params.total || '0')

  const [method, setMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  // Card fields
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry]   = useState('')
  const [cvv, setCvv]         = useState('')
  const [upiId, setUpiId]     = useState('')

  const formatCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '')
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2, 4) : d
  }

  const handlePay = async () => {
    setError('')
    if (method === 'card') {
      if (cardNum.replace(/\s/g, '').length < 16) return setError('Enter a valid 16-digit card number.')
      if (expiry.length < 4) return setError('Enter a valid expiry date.')
      if (cvv.length < 3)   return setError('Enter a valid CVV.')
    }
    if (method === 'upi' && !upiId.includes('@')) return setError('Enter a valid UPI ID (e.g. name@upi).')
    if (method === 'wallet' && total > 2000)       return setError('Insufficient wallet balance.')

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1800)) // simulate processing

    try {
      const { data } = await api.post('/bookings', { showId: parseInt(showId), seatIds, paymentMethod: method })
      router.replace({
        pathname: '/screens/Confirmation',
        params: {
          bookingId:   String(data.booking.id),
          bookingData: JSON.stringify(data.booking),
          qrCode:      data.qrCode,
        },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Order summary */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <Divider />
        {[
          ['Movie',     movie?.title],
          ['Theater',   show?.theater?.name],
          ['Date',      show?.date],
          ['Time',      show?.time],
          ['Format',    show?.format],
          ['Seats',     `${seatIds.length} seat(s)`],
        ].map(([label, val]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowVal}>{val}</Text>
          </View>
        ))}
        <Divider />
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: Colors.subtext, fontWeight: '700' }]}>Total</Text>
          <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
        </View>
      </Card>

      {/* Payment method */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <Divider />
        <View style={styles.methodRow}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setMethod(m.id)}
              style={[styles.methodBtn, method === m.id && styles.methodBtnActive]}
            >
              <Text style={{ fontSize: 18 }}>{m.icon}</Text>
              <Text style={[styles.methodLabel, method === m.id && { color: Colors.white }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card form */}
        {method === 'card' && (
          <View style={styles.formSection}>
            <Input
              label="Card Number"
              value={cardNum}
              onChangeText={(v) => setCardNum(formatCard(v))}
              keyboardType="number-pad"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Input
                  label="MM/YY"
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  keyboardType="number-pad"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="CVV"
                  value={cvv}
                  onChangeText={(v) => setCvv(v.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  placeholder="•••"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {method === 'upi' && (
          <View style={styles.formSection}>
            <Input
              label="UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@upi"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        )}

        {method === 'wallet' && (
          <View style={styles.walletBox}>
            <Text style={styles.walletBalance}>
              💛 Wallet balance: <Text style={{ color: Colors.white, fontWeight: '700' }}>₹2,000.00</Text>
            </Text>
            {total > 2000 && <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>Insufficient balance.</Text>}
          </View>
        )}
      </Card>

      <ErrorBox message={error} />

      <Button
        title={loading ? 'Processing…' : `Pay ₹${total.toFixed(2)}`}
        onPress={handlePay}
        disabled={loading || (method === 'wallet' && total > 2000)}
        style={styles.payBtn}
      />

      <Text style={styles.disclaimer}>🔒 Prototype only — no real payment is processed.</Text>
      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.dark, padding: 16 },
  card:       { padding: 16, marginBottom: 14 },
  sectionTitle: { color: Colors.white, fontWeight: '800', fontSize: 16, marginBottom: 4 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel:   { color: Colors.muted, fontSize: 13 },
  rowVal:     { color: Colors.white, fontSize: 13, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  totalAmount: { color: Colors.red, fontWeight: '800', fontSize: 18 },
  methodRow:  { gap: 8, marginBottom: 4 },
  methodBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: 6,
  },
  methodBtnActive: { borderColor: Colors.red, backgroundColor: 'rgba(229,9,20,0.08)' },
  methodLabel: { color: Colors.muted, fontSize: 14, fontWeight: '600' },
  formSection: { marginTop: 8 },
  twoCol:     { flexDirection: 'row', gap: 12 },
  walletBox:  { backgroundColor: '#1a1a00', borderRadius: Radius.md, padding: 12, marginTop: 8 },
  walletBalance: { color: Colors.muted, fontSize: 14 },
  payBtn:     { marginBottom: 10 },
  disclaimer: { color: Colors.muted, fontSize: 11, textAlign: 'center', marginBottom: 8 },
})
