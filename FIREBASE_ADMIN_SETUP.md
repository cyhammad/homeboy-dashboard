# Firebase Admin Dashboard Setup Guide

## 🚀 Complete Firebase Configuration

This guide covers the complete Firebase setup for the HomeBoy Admin Dashboard, including all collections, variables, and configuration details.

## 📋 Table of Contents

1. [Firebase Configuration](#firebase-configuration)
2. [Environment Variables](#environment-variables)
3. [Firestore Collections](#firestore-collections)
4. [Data Models](#data-models)
5. [Firebase Services](#firebase-services)
6. [Authentication Flow](#authentication-flow)
7. [CRUD Operations](#crud-operations)
8. [Real-time Features](#real-time-features)
9. [Security Rules](#security-rules)
10. [Deployment](#deployment)

## 🔧 Firebase Configuration

### Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Services Enabled

- ✅ **Authentication** - Email/Password
- ✅ **Firestore Database** - NoSQL document database
- ✅ **Storage** - File storage for images
- ✅ **Analytics** - User behavior tracking
- ✅ **Emulators** - Local development support

## 📊 Firestore Collections

### 1. Users Collection (`users`)

**Purpose**: Store admin user information

```javascript
// Document Structure
{
  uid: "firebase_auth_uid",
  email: "admin@example.com",
  displayName: "Admin User",
  role: "admin",
  isAdmin: true,
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  lastLogin: "2024-01-01T00:00:00.000Z"
}
```

**Fields**:
- `uid` (string): Firebase Auth UID
- `email` (string): User email address
- `displayName` (string): User's full name
- `role` (string): User role (admin, super_admin)
- `isAdmin` (boolean): Admin status
- `status` (string): active, inactive, pending
- `createdAt` (timestamp): Account creation date
- `updatedAt` (timestamp): Last update date
- `lastLogin` (timestamp): Last login date

### 2. Listings Collection (`listings`)

**Purpose**: Store property listings

```javascript
// Document Structure
{
  listingId: "listing_123",
  title: "Beautiful 3BR Apartment",
  description: "Spacious apartment in downtown...",
  price: 2500,
  location: "New York, NY",
  propertyType: "apartment",
  bedrooms: 3,
  bathrooms: 2,
  area: 1200,
  images: ["url1", "url2"],
  status: "pending",
  ownerId: "owner_123",
  ownerName: "John Doe",
  ownerEmail: "john@example.com",
  ownerPhone: "+1234567890",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

**Fields**:
- `listingId` (string): Unique listing identifier
- `title` (string): Property title
- `description` (string): Property description
- `price` (number): Monthly rent/price
- `location` (string): Property location
- `propertyType` (string): apartment, house, condo, studio, villa, townhouse, commercial
- `bedrooms` (number): Number of bedrooms
- `bathrooms` (number): Number of bathrooms
- `area` (number): Property area in sq ft
- `images` (array): Array of image URLs
- `status` (string): pending, approved, rejected, active, inactive
- `ownerId` (string): Property owner ID
- `ownerName` (string): Owner's name
- `ownerEmail` (string): Owner's email
- `ownerPhone` (string): Owner's phone
- `createdAt` (timestamp): Listing creation date
- `updatedAt` (timestamp): Last update date

### 3. Inquiries Collection (`inquiries`)

**Purpose**: Store property inquiries from potential tenants

```javascript
// Document Structure
{
  inquiryId: "inquiry_123",
  listingId: "listing_123",
  inquirerName: "Jane Smith",
  inquirerEmail: "jane@example.com",
  inquirerPhone: "+1234567890",
  message: "I'm interested in this property...",
  inquiryType: "viewing",
  priority: "medium",
  status: "pending",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

**Fields**:
- `inquiryId` (string): Unique inquiry identifier
- `listingId` (string): Related listing ID
- `inquirerName` (string): Inquirer's name
- `inquirerEmail` (string): Inquirer's email
- `inquirerPhone` (string): Inquirer's phone
- `message` (string): Inquiry message
- `inquiryType` (string): general, viewing, price_inquiry, availability, complaint
- `priority` (string): low, medium, high
- `status` (string): pending, approved, rejected, completed
- `createdAt` (timestamp): Inquiry creation date
- `updatedAt` (timestamp): Last update date

### 4. Notifications Collection (`notifications`)

**Purpose**: Store system notifications for admins

```javascript
// Document Structure
{
  notificationId: "notif_123",
  userId: "admin_123",
  title: "New Inquiry Received",
  message: "A new inquiry has been received for listing XYZ",
  type: "new_inquiry",
  read: false,
  actionUrl: "/inquiries/123",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

**Fields**:
- `notificationId` (string): Unique notification identifier
- `userId` (string): Target user ID
- `title` (string): Notification title
- `message` (string): Notification message
- `type` (string): new_inquiry, new_listing, system_update, reminder, alert
- `read` (boolean): Read status
- `actionUrl` (string): URL to navigate to when clicked
- `createdAt` (timestamp): Notification creation date

### 5. Analytics Collection (`analytics`)

**Purpose**: Store dashboard analytics data

```javascript
// Document Structure
{
  metric: "page_views",
  value: 150,
  dimensions: {
    page: "/dashboard",
    user: "admin_123"
  },
  date: "2024-01-01T00:00:00.000Z"
}
```

**Fields**:
- `metric` (string): Metric name (page_views, user_signups, etc.)
- `value` (number): Metric value
- `dimensions` (object): Additional metadata
- `date` (timestamp): Data collection date

### 6. Settings Collection (`settings`)

**Purpose**: Store application settings

```javascript
// Document Structure
{
  key: "app_config",
  value: {
    maintenanceMode: false,
    maxFileSize: 5242880,
    allowedFileTypes: ["jpg", "png", "pdf"]
  },
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 7. Logs Collection (`logs`)

**Purpose**: Store system logs and audit trails

```javascript
// Document Structure
{
  level: "info",
  message: "User logged in",
  userId: "admin_123",
  action: "login",
  metadata: {
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
  },
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read/write all data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🛠️ Firebase Utilities

### Available Functions

#### User Operations
- `createUser(userId, userData)` - Create new user
- `getUserById(userId)` - Get user by ID
- `updateUser(userId, updateData)` - Update user data
- `getAllUsers(limitCount)` - Get all users

#### Listing Operations
- `createListing(listingData)` - Create new listing
- `getListingById(listingId)` - Get listing by ID
- `getListings(filters)` - Get listings with filters
- `updateListingStatus(listingId, status)` - Update listing status

#### Inquiry Operations
- `createInquiry(inquiryData)` - Create new inquiry
- `getInquiries(filters)` - Get inquiries with filters
- `updateInquiryStatus(inquiryId, status)` - Update inquiry status

#### Notification Operations
- `createNotification(notificationData)` - Create notification
- `getUserNotifications(userId, limitCount)` - Get user notifications
- `markNotificationAsRead(notificationId)` - Mark as read

#### Analytics Operations
- `recordAnalytics(metric, value, dimensions)` - Record analytics
- `getAnalytics(metric, days)` - Get analytics data

#### Real-time Operations
- `listenToCollection(collectionName, callback, filters)` - Real-time listener
- `batchDelete(docIds, collectionName)` - Batch delete
- `batchUpdate(updates, collectionName)` - Batch update

## 📱 Authentication Flow

### Sign Up Process
1. User fills signup form
2. Firebase creates auth user
3. User document created in Firestore
4. User redirected to dashboard

### Sign In Process
1. User enters credentials
2. Firebase authenticates user
3. User data fetched from Firestore
4. User redirected to dashboard

### Sign Out Process
1. Firebase signs out user
2. User redirected to login page

## 🚀 Deployment

### Production Setup
1. Create Firebase project
2. Enable required services
3. Set up security rules
4. Configure environment variables
5. Deploy to Vercel/Netlify

### Development Setup
1. Install Firebase CLI
2. Run `firebase emulators:start`
3. Set up local environment variables
4. Test with emulators

## 📊 Monitoring

### Analytics Events
- User signups
- Page views
- Feature usage
- Error rates

### Logging
- Authentication events
- CRUD operations
- System errors
- Performance metrics

## 🔧 Troubleshooting

### Common Issues
1. **Authentication errors** - Check Firebase config
2. **Permission denied** - Verify security rules
3. **Network errors** - Check internet connection
4. **Data not loading** - Verify Firestore rules

### Debug Steps
1. Check browser console for errors
2. Verify environment variables
3. Test with Firebase emulators
4. Check Firestore security rules

## 📞 Support

For issues or questions:
1. Check Firebase documentation
2. Review error logs
3. Test with emulators
4. Contact development team

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Firebase SDK**: v9+
**Next.js**: v14+
