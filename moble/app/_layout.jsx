import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Stack, Tabs, useRouter, useSegments } from 'expo-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Colors } from './theme'
import { StatusBar } from 'expo-status-bar'

function AuthGate({ children }) {
  const { user, loading } = useAuth()
  const segments = useSegments()
  const router   = useRouter()

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === 'screens' &&
      (segments[1] === 'Login' || segments[1] === 'Register')

    if (user && inAuthGroup) {
      router.replace('/')
    }
  }, [user, loading, segments])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.red} size="large" />
      </View>
    )
  }
  return children
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerStyle:      { backgroundColor: Colors.dark },
            headerTintColor:  Colors.white,
            headerTitleStyle: { fontWeight: '700', letterSpacing: 1 },
            contentStyle:     { backgroundColor: Colors.dark },
            headerBackTitle:  'Back',
          }}
        >
          <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
          <Stack.Screen name="screens/MovieDetail" options={{ title: 'Movie Details' }} />
          <Stack.Screen name="screens/ShowSeats"   options={{ title: 'Select Seats' }} />
          <Stack.Screen name="screens/Payment"     options={{ title: 'Payment' }} />
          <Stack.Screen name="screens/Confirmation" options={{ title: 'Booking Confirmed', headerBackVisible: false }} />
          <Stack.Screen name="screens/Login"       options={{ title: 'Sign In', headerShown: false }} />
          <Stack.Screen name="screens/Register"    options={{ title: 'Create Account', headerShown: false }} />
          <Stack.Screen name="screens/admin/Dashboard" options={{ title: 'Admin Dashboard' }} />
          <Stack.Screen name="screens/admin/Movies"    options={{ title: 'Manage Movies' }} />
          <Stack.Screen name="screens/admin/Theaters"  options={{ title: 'Manage Theaters' }} />
          <Stack.Screen name="screens/admin/Shows"     options={{ title: 'Manage Shows' }} />
          <Stack.Screen name="screens/admin/Bookings"  options={{ title: 'All Bookings' }} />
        </Stack>
      </AuthGate>
    </AuthProvider>
  )
}
