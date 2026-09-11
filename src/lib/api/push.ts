import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { savePushToken } from '@/lib/api/profile';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Enregistre le token push Expo de cet appareil dans profiles.push_token.
// Côté serveur, un trigger sur `notifications` envoie ensuite le push via
// l'API Expo dès qu'une notification interne est créée (voir migration
// push_notifications_and_cleanup).
export async function registerForPushNotifications() {
  if (!Device.isDevice) return; // pas de push sur émulateur

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    await savePushToken(tokenResponse.data);
  } catch {
    // Pas grave si ça échoue (ex. pas encore de projectId EAS valide) : l'app
    // continue de fonctionner sans push.
  }
}
