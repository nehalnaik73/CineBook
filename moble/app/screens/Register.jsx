import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Card, ErrorBox } from '../components/UI'
import { Colors } from '../theme'

export default function Register() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return setError('Name, email, and password are required.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setError(''); setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
      router.replace('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoWrap}>
        <Text style={{ fontSize: 48 }}>🎬</Text>
        <Text style={styles.title}>JOIN US</Text>
        <Text style={styles.subtitle}>Create your CineBook account</Text>
      </View>

      <Card style={styles.form}>
        <ErrorBox message={error} />
        <Input label="Full Name"       value={form.name}     onChangeText={set('name')}     placeholder="John Doe" />
        <Input label="Email"           value={form.email}    onChangeText={set('email')}    keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <Input label="Phone (optional)" value={form.phone}   onChangeText={set('phone')}    keyboardType="phone-pad" placeholder="+91 98765 43210" />
        <Input label="Password"        value={form.password} onChangeText={set('password')} secureTextEntry placeholder="Min. 6 characters" />
        <Button title={loading ? 'Creating account…' : 'Create Account'} onPress={handleRegister} disabled={loading} />
      </Card>

      <TouchableOpacity onPress={() => router.push('/screens/Login')} style={styles.switchLink}>
        <Text style={styles.switchText}>Already have an account? <Text style={{ color: Colors.red }}>Sign in →</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.dark, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  title: { color: Colors.white, fontSize: 36, fontWeight: '900', letterSpacing: 4, marginTop: 6 },
  subtitle: { color: Colors.muted, fontSize: 14, marginTop: 4 },
  form: { padding: 20, marginBottom: 16 },
  switchLink: { alignItems: 'center' },
  switchText: { color: Colors.muted, fontSize: 14 },
})
