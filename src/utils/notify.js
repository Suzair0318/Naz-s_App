import { Platform, NativeModules } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';

const CHANNEL_ID = 'general';
const ORDER_CHANNEL_ID = 'order_success';

let configured = false;

export function initNotifications() {
  if (configured) return;
  try {
    // If native module is not linked yet (e.g., app not rebuilt), skip to avoid crash
    if (!NativeModules || !NativeModules.RNPushNotification) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[Notifications] RNPushNotification native module not found. Rebuild the app to link native code.');
      }
      return;
    }
    // Request Android 13+ notification permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const perm = PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
      if (perm) {
        check(perm)
          .then((status) => {
            if (status !== RESULTS.GRANTED) return request(perm);
            return status;
          })
          .catch(() => {});
      }
    }
    PushNotification.configure({
      onNotification: function () {},
      popInitialNotification: true,
      // iOS only; Android handled above
      requestPermissions: Platform.OS === 'ios',
    });
    // Ensure default channels exist on Android
    PushNotification.createChannel(
      {
        channelId: CHANNEL_ID,
        channelName: 'General Notifications',
        channelDescription: 'General notifications for Naz\'s Collection',
        importance: 5, // IMPORTANCE_HIGH
        vibrate: true,
        soundName: 'default',
      },
      () => {}
    );

    // Dedicated channel for order success with maximum importance and sound
    PushNotification.createChannel(
      {
        channelId: ORDER_CHANNEL_ID,
        channelName: 'Order Updates',
        channelDescription: 'Order status and confirmations',
        importance: 5, // IMPORTANCE_HIGH (max visual)
        vibrate: true,
        soundName: 'default',
        playSound: true,
        lockscreenVisibility: 1, // VISIBILITY_PUBLIC
      },
      () => {}
    );
    configured = true;
  } catch (e) {
    // no-op
  }
}

// Explicitly request notification permission (Android 13+) – returns a Promise<boolean>
export async function requestNotificationsPermission() {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const perm = PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
      if (!perm) return true;
      const status = await check(perm);
      if (status === RESULTS.GRANTED) return true;
      const next = await request(perm);
      return next === RESULTS.GRANTED;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function notifySuccess(message) {
  initNotifications();
  try {
    PushNotification.localNotification({
      channelId: ORDER_CHANNEL_ID,
      title: 'Success',
      message: String(message || 'Action completed'),
      // Make it loud and visible
      playSound: true,
      soundName: 'default',
      vibrate: true,
      importance: 'max',
      priority: 'max',
      allowWhileIdle: true,
      visibility: 'public',
      invokeApp: true,
      autoCancel: true,
      onlyAlertOnce: false,
      ticker: 'Order update',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_launcher',
    });
  } catch (e) {}
}

export function notifyInfo(title, message) {
  initNotifications();
  try {
    PushNotification.localNotification({
      channelId: CHANNEL_ID,
      title: String(title || 'Info'),
      message: String(message || ''),
      importance: 'default',
      priority: 'default',
    });
  } catch (e) {}
}

// Schedule a notification in N seconds (useful to background the app and receive a heads-up)
export function notifyTestScheduled(message = 'Test notification with sound', seconds = 3) {
  initNotifications();
  try {
    const date = new Date(Date.now() + Math.max(1, seconds) * 1000);
    PushNotification.localNotificationSchedule({
      channelId: ORDER_CHANNEL_ID,
      title: 'Success',
      message: String(message),
      date,
      allowWhileIdle: true,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      importance: 'max',
      priority: 'max',
      visibility: 'public',
      invokeApp: true,
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_launcher',
    });
  } catch (e) {}
}
