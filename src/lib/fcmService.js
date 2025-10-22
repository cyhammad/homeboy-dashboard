// FCM Service for Web Admin Dashboard
// This service handles FCM token management and notification sending for the admin dashboard

import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

class FCMService {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.isInitialized = false;
    this.vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  }

  // Initialize FCM service
  async initialize() {
    if (typeof window === 'undefined') {
      console.log('FCM not supported on server-side');
      return null;
    }

    if (this.isInitialized) {
      return this.messaging;
    }

    try {
      // Check if messaging is supported
      const isSupported = await import('firebase/messaging').then(
        ({ isSupported }) => isSupported()
      );

      if (!isSupported) {
        console.log('FCM is not supported in this browser');
        return null;
      }

      this.messaging = messaging;
      this.isInitialized = true;

      return this.messaging;
    } catch (error) {
      console.error('Error initializing FCM:', error);
      return null;
    }
  }

  // Request notification permission and get FCM token
  async requestPermission() {
    try {
      if (typeof window === 'undefined') {
        console.log('FCM not supported on server-side');
        return null;
      }

      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return null;
      }

      // Initialize FCM if not already done
      const messaging = await this.initialize();
      if (!messaging) {
        return null;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: this.vapidKey
        });
        
        if (token) {
          this.token = token;
          console.log('FCM Token:', token);
          
          // Store token in localStorage for persistence
          localStorage.setItem('admin_fcm_token', token);
          
          // Store token in Firestore for the admin user
          await this.storeTokenInFirestore(token);
          
          return token;
        } else {
          console.log('No registration token available');
          return null;
        }
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Store FCM token in Firestore for the admin user
  async storeTokenInFirestore(token) {
    try {
      const response = await fetch('/api/store-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'admin', // Admin user ID
          fcmToken: token
        })
      });

      if (response.ok) {
        console.log('FCM token stored in Firestore');
        return true;
      } else {
        console.error('Failed to store FCM token in Firestore');
        return false;
      }
    } catch (error) {
      console.error('Error storing FCM token:', error);
      return false;
    }
  }

  // Get stored token
  getStoredToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_fcm_token');
  }

  // Send push notification to admin's mobile app
  async sendNotificationToAdmin(notificationData) {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'admin', // Send to admin user
          notification: {
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data || {},
            icon: notificationData.icon || '/favicon.ico'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification sent successfully:', result);
        return result;
      } else {
        console.error('Failed to send notification');
        return false;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send push notification to any user (for compatibility with NotificationContext)
  async sendNotificationToUser(userId, notificationData) {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          notification: {
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data || {},
            icon: notificationData.icon || '/favicon.ico'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification sent successfully to user:', userId, result);
        return result;
      } else {
        console.error('Failed to send notification to user:', userId);
        return false;
      }
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }

  // Listen for foreground messages
  async onMessage(callback) {
    if (typeof window === 'undefined') return null;
    
    try {
      const messaging = await this.initialize();
      if (!messaging) return null;

      return onMessage(messaging, callback);
    } catch (error) {
      console.error('Error setting up message listener:', error);
      return null;
    }
  }

  // Initialize FCM service (legacy method for compatibility)
  async initializeFCM() {
    try {
      // Check if we have a stored token
      const storedToken = this.getStoredToken();
      if (storedToken) {
        this.token = storedToken;
        console.log('Using stored FCM token');
        return storedToken;
      }

      // Request permission and get new token
      return await this.requestPermission();
    } catch (error) {
      console.error('Error initializing FCM:', error);
      return null;
    }
  }

  // Clear stored token
  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_fcm_token');
    }
    this.token = null;
  }
}

// Create singleton instance
const fcmService = new FCMService();

export default fcmService;