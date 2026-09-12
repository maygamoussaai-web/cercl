import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootNavigation() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const first = segments[0] as string | undefined;
    const inAuthScreen = first === 'sign-in' || first === 'sign-up';
    const inOnboarding = first === 'onboarding';
    const inJoin = first === 'join';

    if (!session && !inAuthScreen && !inJoin) {
      router.replace('/sign-in');
    } else if (session && !profile && !inOnboarding && !inJoin) {
      router.replace('/onboarding');
    } else if (session && profile && (inAuthScreen || inOnboarding)) {
      router.replace('/');
    }
  }, [session, profile, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigation />
    </AuthProvider>
  );
}
