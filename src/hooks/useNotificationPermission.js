import { useEffect } from 'react';
import { requestNotificationPermission, onForegroundMessage, showNotification } from '@/lib/fcm-client';

/**
 * Hook to set up FCM listeners and handle notifications (doesn't request permission if default)
 * Permission is requested via NotificationPermissionDialog component
 */
export const useNotificationPermission = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const initializeNotifications = async () => {
      try {
        // Only get token if permission is already granted (dialog handles requesting permission)
        if ('Notification' in window && Notification.permission === 'granted') {
        const token = await requestNotificationPermission();
        
        if (token) {
          // Update FCM token on server
          try {
            const idToken = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c=>c.startsWith('firebase-token='))?.split('=')[1] || '') : '';
            const resp = await fetch('/api/auth/update-fcm-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(idToken ? { 'x-firebase-token': idToken } : {}),
              },
              body: JSON.stringify({ fcmToken: token }),
            });
            if (!resp.ok) {
              const txt = await resp.text();
              console.error('Failed to update FCM token:', resp.status, txt);
            } else {
              console.log('FCM token updated on server');
            }
          } catch (error) {
            console.error('Error updating FCM token on server:', error);
          }
        }
        }

        // Set up foreground message listener to show push notifications from mobile app
        onForegroundMessage((payload) => {
          console.log('Push notification received in foreground:', payload);
          
          // Show browser notification when notification comes from mobile app
          if (payload.notification) {
            showNotification(payload);
          }
        });

        console.log('Notification system initialized');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    // Initialize with a slight delay to ensure Firebase is ready
    const timer = setTimeout(() => {
      initializeNotifications();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
};

