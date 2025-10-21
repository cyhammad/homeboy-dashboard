// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Firebase Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Connect to Firebase emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Only connect if not already connected
    if (!auth._delegate._config?.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    if (!db._delegate._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (!storage._delegate._host?.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
        } catch (err) {
          console.log('Firebase emulators already connected or not available');
        }
}

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  LISTINGS: 'listings',
  INQUIRIES: 'inquiries',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  LOGS: 'logs'
};

// Firestore Field Names
export const FIELDS = {
  // User fields
  USER_ID: 'uid',
  EMAIL: 'email',
  DISPLAY_NAME: 'displayName',
  ROLE: 'role',
  IS_ADMIN: 'isAdmin',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  LAST_LOGIN: 'lastLogin',
  STATUS: 'status',
  
  // Listing fields
  LISTING_ID: 'listingId',
  TITLE: 'title',
  DESCRIPTION: 'description',
  PRICE: 'price',
  LOCATION: 'location',
  PROPERTY_TYPE: 'propertyType',
  BEDROOMS: 'bedrooms',
  BATHROOMS: 'bathrooms',
  AREA: 'area',
  IMAGES: 'images',
  STATUS: 'status',
  OWNER_ID: 'ownerId',
  OWNER_NAME: 'ownerName',
  OWNER_EMAIL: 'ownerEmail',
  OWNER_PHONE: 'ownerPhone',
  
  // Inquiry fields
  INQUIRY_ID: 'inquiryId',
  LISTING_ID: 'listingId',
  INQUIRER_NAME: 'inquirerName',
  INQUIRER_EMAIL: 'inquirerEmail',
  INQUIRER_PHONE: 'inquirerPhone',
  MESSAGE: 'message',
  INQUIRY_TYPE: 'inquiryType',
  PRIORITY: 'priority',
  
  // Notification fields
  NOTIFICATION_ID: 'notificationId',
  USER_ID: 'userId',
  TITLE: 'title',
  MESSAGE: 'message',
  TYPE: 'type',
  READ: 'read',
  ACTION_URL: 'actionUrl',
  
  // Analytics fields
  DATE: 'date',
  METRIC: 'metric',
  VALUE: 'value',
  DIMENSIONS: 'dimensions'
};

// Status Enums
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Property Types
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  CONDO: 'condo',
  STUDIO: 'studio',
  VILLA: 'villa',
  TOWNHOUSE: 'townhouse',
  COMMERCIAL: 'commercial'
};

// Inquiry Types
export const INQUIRY_TYPES = {
  GENERAL: 'general',
  VIEWING: 'viewing',
  PRICE_INQUIRY: 'price_inquiry',
  AVAILABILITY: 'availability',
  COMPLAINT: 'complaint'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_INQUIRY: 'new_inquiry',
  NEW_LISTING: 'new_listing',
  SYSTEM_UPDATE: 'system_update',
  REMINDER: 'reminder',
  ALERT: 'alert'
};

export default app;
