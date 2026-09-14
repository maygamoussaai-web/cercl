import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/constants/theme';

// Navigation à 4 onglets — PLACEHOLDER, voir docs/DECISIONS.md.
// Le cahier des charges §36 demande de valider la structure exacte des 4 pages
// principales avant implémentation définitive : ne pas considérer ceci comme figé.
//
// Icônes via @expo/vector-icons : déjà inclus dans Expo, aucune dépendance
// supplémentaire (philosophie Ponytail : réutiliser l'existant).
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cercles',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'ellipse' : 'ellipse-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="amis"
        options={{
          title: 'Amis',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifs',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
