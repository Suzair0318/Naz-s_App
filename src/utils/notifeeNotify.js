import notifee, { AndroidImportance, TimestampTrigger, TriggerType, AndroidVisibility } from '@notifee/react-native';
import { Platform } from 'react-native';

const ORDER_CHANNEL_ID = 'order_success';

let channelReady = false;

async function ensureChannel() {
  if (Platform.OS !== 'android') return null;
  if (channelReady) return ORDER_CHANNEL_ID;
  const channelId = await notifee.createChannel({
    id: ORDER_CHANNEL_ID,
    name: 'Order Updates',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    lights: true,
  });
  channelReady = true;
  return channelId;
}

export async function requestNotificationsPermission() {
  try {
    // Notifee handles Android 13+ permission internally
    const settings = await notifee.requestPermission();
    // settings.authorizationStatus may be undefined on Android < 13, treat as granted
    return true;
  } catch (e) {
    return false;
  }
}

export async function showOrderSuccess(message = 'Your order has been placed successfully') {
  await ensureChannel();
  try {
    await notifee.displayNotification({
      title: 'Success',
      body: String(message),
      android: {
        channelId: ORDER_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        visibility: AndroidVisibility.PUBLIC,
        autoCancel: true,
        showTimestamp: true,
      },
    });
  } catch (e) {
    // no-op
  }
}

export async function showTestScheduled(message = 'Test notification with sound', seconds = 3) {
  await ensureChannel();
  try {
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + Math.max(1, seconds) * 1000,
      alarmManager: true,
    };

    await notifee.createTriggerNotification(
      {
        title: 'Test',
        body: String(message),
        android: {
          channelId: ORDER_CHANNEL_ID,
          smallIcon: 'ic_launcher',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          visibility: AndroidVisibility.PUBLIC,
          autoCancel: true,
          pressAction: { id: 'default' },
        },
      },
      trigger
    );
  } catch (e) {
    // no-op
  }
}
