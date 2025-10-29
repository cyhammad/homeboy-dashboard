import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// VAPID key for web push notifications
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Initialize messaging only on client side
let messaging = null;
let swRegistration = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);
  }
}

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export async function requestNotificationPermission() {
  try {
    // Check if we're on client side and messaging is available
    if (typeof window === 'undefined' || !messaging) {
      console.log('Firebase Messaging not available (SSR or not supported)');
      return null;
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Ensure service worker is registered and cached for getToken
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.getRegistration();
        if (!swRegistration) {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered:', swRegistration);
        } else {
          console.log('Service Worker already registered:', swRegistration);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Check current permission status
    let permission = Notification.permission;
    
    if (permission === 'default') {
      // Request permission
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token and explicitly bind to our Service Worker registration
      try {
        const token = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: swRegistration || undefined,
        });
        
        if (token) {
          console.log('FCM token obtained:', token);
          return token;
        } else {
          console.log('No registration token available');
          return null;
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export function onForegroundMessage(callback) {
  if (typeof window === 'undefined' || !messaging) {
    console.log('Firebase Messaging not available for foreground messages');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
}

/**
 * Show notification
 * @param {Object} payload - Notification payload
 */
export function showNotification(payload) {
  if (typeof window === 'undefined') {
    console.log('Cannot show notification on server side');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'homeboy-notification',
    });

    notification.onclick = function() {
      window.focus();
      notification.close();
    };
  }
}
