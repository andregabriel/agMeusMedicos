import { useState, useEffect } from 'react';
import { NotificationPermission } from '@/types';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    supported: false,
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission({
        granted: Notification.permission === 'granted',
        supported: true,
      });
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission({
        granted: result === 'granted',
        supported: true,
      });
      return result === 'granted';
    }
    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission.granted) {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'medication-reminder',
        ...options,
      });
    }
  };

  const scheduleNotification = (title: string, time: Date, options?: NotificationOptions) => {
    const now = new Date().getTime();
    const scheduleTime = time.getTime();
    const delay = scheduleTime - now;

    if (delay > 0) {
      setTimeout(() => {
        showNotification(title, options);
      }, delay);
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
  };
}