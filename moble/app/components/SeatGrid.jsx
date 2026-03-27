import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Colors, Radius } from '../theme'

export default function SeatGrid({ seats, selected, onToggle }) {
  if (!seats || seats.length === 0) {
    return <Text style={{ color: Colors.muted, textAlign: 'center', paddingVertical: 20 }}>No seats available.</Text>
  }

  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {})

  return (
    <View>
      {/* Screen */}
      <View style={styles.screenWrap}>
        <View style={styles.screenBar} />
        <Text style={styles.screenLabel}>SCREEN</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {Object.entries(rows).map(([row, rowSeats]) => (
            <View key={row} style={styles.row}>
              <Text style={styles.rowLabel}>{row}</Text>
              {rowSeats.sort((a, b) => a.number - b.number).map((seat) => {
                const isSelected = selected.includes(seat.id)
                const isBooked   = seat.status === 'booked'
                return (
                  <TouchableOpacity
                    key={seat.id}
                    disabled={isBooked}
                    onPress={() => onToggle(seat.id)}
                    style={[
                      styles.seat,
                      isBooked   ? styles.seatBooked   :
                      isSelected ? styles.seatSelected : styles.seatAvailable,
                    ]}
                  >
                    <Text style={[styles.seatNum, { color: isBooked ? '#444' : isSelected ? '#fff' : '#94a3b8' }]}>
                      {seat.number}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { label: 'Available', style: styles.seatAvailable },
          { label: 'Selected',  style: styles.seatSelected },
          { label: 'Booked',    style: styles.seatBooked },
        ].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, l.style]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screenWrap: { alignItems: 'center', marginBottom: 16 },
  screenBar: { width: '70%', height: 3, backgroundColor: '#555', borderRadius: 2, marginBottom: 4 },
  screenLabel: { color: Colors.muted, fontSize: 10, letterSpacing: 3 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rowLabel: { color: Colors.muted, fontSize: 10, width: 16, fontFamily: 'monospace', textAlign: 'center', marginRight: 4 },
  seat: {
    width: 30, height: 26, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 2,
    borderWidth: 1.5,
  },
  seatAvailable: { backgroundColor: '#1e293b', borderColor: '#334155' },
  seatSelected:  { backgroundColor: Colors.red,  borderColor: Colors.red },
  seatBooked:    { backgroundColor: '#1a1a1a',   borderColor: '#2a2a2a' },
  seatNum: { fontSize: 9, fontWeight: '700' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 12, borderRadius: 3, borderWidth: 1.5 },
  legendText: { color: Colors.muted, fontSize: 11 },
})
