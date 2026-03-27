import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput } from 'react-native'
import { Colors, Radius } from '../theme'

// ── Button ────────────────────────────────────────────────
export function Button({ title, onPress, disabled, variant = 'primary', style }) {
  const bg = variant === 'primary' ? Colors.red : 'transparent'
  const border = variant === 'outline' ? Colors.cardBorder : 'transparent'
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'outline' ? 1 : 0, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {disabled
        ? <ActivityIndicator color={Colors.white} size="small" />
        : <Text style={styles.btnText}>{title}</Text>}
    </TouchableOpacity>
  )
}

// ── Input ─────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={Colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  )
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ label, color = Colors.cardBorder, textColor = Colors.subtext }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  )
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 'large' }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.red} size={size} />
    </View>
  )
}

// ── ErrorBox ──────────────────────────────────────────────
export function ErrorBox({ message }) {
  if (!message) return null
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  )
}

// ── SectionTitle ─────────────────────────────────────────
export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>
}

// ── Divider ──────────────────────────────────────────────
export function Divider() {
  return <View style={styles.divider} />
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  label: { color: Colors.subtext, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    color: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  errorBox: {
    backgroundColor: '#2d0a0a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: '#fca5a5', fontSize: 13 },
  sectionTitle: { color: Colors.white, fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 12 },
})
