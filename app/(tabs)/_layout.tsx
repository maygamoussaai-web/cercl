import { Tabs } from 'expo-router';

import { colors } from '@/constants/theme';

// Navigation à 4 onglets — PLACEHOLDER, voir docs/DECISIONS.md.
// Le cahier des charges §36 demande de valider la structure exacte des 4 pages
// principales avant implémentation définitive : ne pas considérer ceci comme figé.
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
      <Tabs.Screen name="index" options={{ title: 'Cercles' }} />
      <Tabs.Screen name="amis" options={{ title: 'Amis' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifs' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
