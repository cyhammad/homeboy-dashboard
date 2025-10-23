/**
 * Safe FCM client that handles SSR properly
 */

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export async function requestNotificationPermission() {
  try {
    // Check if we're on client side
    if (typeof window === 'undefined') {
      console.log('Not on client side, skipping FCM initialization');
      return null;
    }

    // Dynamic import to avoid SSR issues
    const { getMessaging, getToken } = await import('firebase/messaging');
    const { initializeApp } = await import('firebase/app');

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
    const messaging = getMessaging(app);

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
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
      
      // Get FCM token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });
      
      if (token) {
        console.log('FCM token obtained:', token);
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
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export async function onForegroundMessage(callback) {
  try {
    if (typeof window === 'undefined') {
      console.log('Not on client side, skipping foreground message listener');
      return;
    }

    const { getMessaging, onMessage } = await import('firebase/messaging');
    const { initializeApp } = await import('firebase/app');

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
    const messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
  }
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
