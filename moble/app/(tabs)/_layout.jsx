import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { Colors } from '../theme'

function TabIcon({ icon, focused }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
}

export default function TabLayout() {
  const { user } = useAuth()

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: Colors.cardBorder,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   Colors.red,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle:      { backgroundColor: Colors.dark },
        headerTintColor:  Colors.white,
        headerTitleStyle: { fontWeight: '800', letterSpacing: 2, fontSize: 18 },
        contentStyle:     { backgroundColor: Colors.dark },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: '🎬 CINEBOOK',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Movies',
          tabBarIcon: ({ focused }) => <TabIcon icon="🎬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: user ? 'Profile' : 'Account',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
