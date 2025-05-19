import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PhotoData } from '../context/PhotoContext';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  // Request permissions for notifications
  static async requestPermissions() {
    if (!Device.isDevice) {
      console.log('Physical device required for notifications');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  // Send notification about a newly captured photo
  static async notifyNewPhoto(photo: PhotoData) {
    // Request permissions if not already granted
    const permissionGranted = await this.requestPermissions();
    if (!permissionGranted) {
      console.log('Notification permission not granted');
      return false;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Photo Captured!',
          body: photo.address 
            ? `Memory saved from ${photo.address}`
            : 'New memory saved',
          data: { photoId: photo.id },
        },
        trigger: null, // Send immediately
      });
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }


  // Get all scheduled notifications
  static async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Cancel a specific notification
  static async cancelNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  // Cancel all notifications
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default NotificationService;