// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
const firebaseConfig = {
  apiKey: "AIzaSyCwgLYe6DDfIlL3E6itWV5NpW0YeMow95o",
  authDomain: "homeboy-app-1705d.firebaseapp.com",
  projectId: "homeboy-app-1705d",
  storageBucket: "homeboy-app-1705d.appspot.com",
  messagingSenderId: "848431761997",
  appId: "1:848431761997:web:4b4259da07045a29926a04",
  measurementId: "G-FWMNX9RCHY"
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
    tag: 'homeboy-notification',
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
