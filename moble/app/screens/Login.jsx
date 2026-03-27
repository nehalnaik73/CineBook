import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Card, ErrorBox } from '../components/UI'
import { Colors, Radius } from '../theme'

export default function Login() {
  const { login }  = useAuth()
  const router     = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleLogin = async () => {
    if (!email || !password) return setError('Email and password are required.')
    setError(''); setLoading(true)
    try {
      const user = await login(email, password)
      router.replace(user.role === 'admin' ? '/screens/admin/Dashboard' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.logoWrap}>
        <Text style={{ fontSize: 48 }}>🎬</Text>
        <Text style={styles.title}>SIGN IN</Text>
        <Text style={styles.subtitle}>Welcome back to CineBook</Text>
      </View>

      <Card style={styles.form}>
        <ErrorBox message={error} />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <Input label="Password" value={password} onChangeText={setPass} secureTextEntry placeholder="••••••••" />
        <Button title={loading ? 'Signing in…' : 'Sign In'} onPress={handleLogin} disabled={loading} />
      </Card>

      <TouchableOpacity onPress={() => router.push('/screens/Register')} style={styles.switchLink}>
        <Text style={styles.switchText}>Don't have an account? <Text style={{ color: Colors.red }}>Create one →</Text></Text>
      </TouchableOpacity>

      {/* Demo credentials */}
      <Card style={styles.demoCard}>
        <Text style={styles.demoTitle}>Demo accounts</Text>
        <Text style={styles.demoText}>Admin: admin@cinebook.com / admin123</Text>
        <Text style={styles.demoText}>User:  john@example.com / user123</Text>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.dark, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  title: { color: Colors.white, fontSize: 36, fontWeight: '900', letterSpacing: 4, marginTop: 6 },
  subtitle: { color: Colors.muted, fontSize: 14, marginTop: 4 },
  form: { padding: 20, marginBottom: 16 },
  switchLink: { alignItems: 'center', marginBottom: 20 },
  switchText: { color: Colors.muted, fontSize: 14 },
  demoCard: { padding: 14 },
  demoTitle: { color: Colors.subtext, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  demoText: { color: Colors.muted, fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
})
