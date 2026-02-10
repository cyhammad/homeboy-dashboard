// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyDGWZSXyS-WoGrWMLZd7i2qvDdKLEdgaeU",
  authDomain: "dealswipe-b7309.firebaseapp.com",
  projectId: "dealswipe-b7309",
  storageBucket: "dealswipe-b7309.firebasestorage.app",
  messagingSenderId: "650049465368",
  appId: "1:650049465368:web:af9c3f6c56cf71c226276d",
  measurementId: "G-P6XD8DVKRH"
};

console.log('Service Worker: Firebase config loaded', firebaseConfig);

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

console.log('Service Worker: Firebase Messaging initialized');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Service Worker: Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'dealswipe-notification',
    data: payload.data,
    requireInteraction: true,
    silent: false
  };

  console.log('Service Worker: Showing notification:', notificationTitle, notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Focus the window or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
