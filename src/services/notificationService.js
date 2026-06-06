import { getMessaging, getToken, onMessage } from 'firebase/messaging';

export async function requestNotificationPermission() {
  const messaging = getMessaging();
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });
    if (token) {
      localStorage.setItem('fcmToken', token);
      // Save token to Firestore
      await saveTokenToFirestore(token);
    }
    return token;
  } catch (err) {
    console.error('Notification permission error:', err);
  }
}