
import { getSettings } from './settingsService';

export const isNotificationSupported = () => {
  return 'Notification' in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser.');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

export const sendNotification = (title: string, body: string) => {
  const settings = getSettings();
  
  // We check if any notification is globally allowed in app settings
  // and if browser permission is granted
  const isAnyEnabled = settings.notifications.dailyReminder || 
                      settings.notifications.comebackReminder || 
                      settings.notifications.revisionReminder;

  if (!isAnyEnabled) return;
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      badge: 'https://api.dicebear.com/7.x/initials/svg?seed=B',
      tag: 'brayner-notification'
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

export const triggerTestNotification = () => {
  sendNotification('BRAYNER', 'Notifications are now active. Prepare for your comeback.');
};
