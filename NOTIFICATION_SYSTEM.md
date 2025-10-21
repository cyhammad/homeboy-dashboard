# Notification System Documentation

## Overview
The notification system provides real-time communication between the admin dashboard and mobile app users. Notifications are stored in Firestore and displayed in real-time.

## Firebase Structure

### Notifications Collection
```javascript
{
  id: "TlvU2EYy9g4oAFD3To7o",
  title: "new inquiry",
  description: "testtt", 
  userId: "lVLrhQ9mLjetdzyHaQr5HAWKpsw1",
  isSeen: false,
  createdAt: "September 9, 2025 at 5:10:40 PM UTC+5", // Firestore Timestamp
  updatedAt: "September 9, 2025 at 5:12:17 PM UTC+5", // Firestore Timestamp
  type: "inquiry", // listing, inquiry, user, system, broadcast
  data: {
    type: "inquiry",
    inquiryId: "abc123",
    source: "app" // or "admin"
  }
}
```

## Components

### 1. useNotifications Hook (`src/hooks/useNotifications.js`)
- Fetches notifications from Firebase context
- Provides functions to mark as read, delete, and send notifications
- Formats time display (e.g., "1m ago", "2h ago")
- Tracks unread count

### 2. NotificationService (`src/lib/notificationService.js`)
- Centralized service for sending notifications
- Methods for different notification types:
  - `sendToAdmin()` - Send from app to admin
  - `sendToUser()` - Send from admin to user
  - `notifyNewListing()` - When new listing is created
  - `notifyListingStatusChange()` - When listing status changes
  - `notifyNewInquiry()` - When new inquiry is created
  - `notifyInquiryStatusChange()` - When inquiry status changes
  - `notifyNewUser()` - When new user registers
  - `notifySystem()` - System notifications
  - `notifyAllUsers()` - Broadcast messages

### 3. Header Component (`src/components/Header/Header.jsx`)
- Displays notification bell with unread count badge
- Opens notification modal when clicked
- Handles notification actions (mark as read, delete)

### 4. DetailsModal (`src/components/Header/DetailsModal.jsx`)
- Shows list of notifications
- Displays unread notifications with blue background
- Clicking notification navigates to relevant page
- Provides delete functionality

### 5. TestNotificationButton (`src/components/notifications/TestNotificationButton.jsx`)
- Test component for sending sample notifications
- Includes different notification types
- Allows testing the complete flow

## Notification Types

### 1. Listing Notifications
- **New Listing Request**: When user submits property listing
- **Listing Status Change**: When admin approves/rejects listing

### 2. Inquiry Notifications  
- **New Inquiry**: When user shows interest in property
- **Inquiry Status Change**: When admin responds to inquiry

### 3. User Notifications
- **New User Registration**: When new user signs up
- **User Status Change**: When user account is activated/deactivated

### 4. System Notifications
- **System Alerts**: Database backups, maintenance, etc.
- **Broadcast Messages**: Admin announcements to all users

## Navigation Flow

### From Admin Dashboard
1. Click notification bell → Opens notification modal
2. Click notification → Navigates to relevant page:
   - Listing notifications → `/listing-requests`
   - Inquiry notifications → `/inquiry-requests` 
   - User notifications → `/dashboard`
3. Notification automatically marked as read

### From Mobile App
1. User performs action (creates listing, makes inquiry)
2. System automatically sends notification to admin
3. Admin sees notification in dashboard
4. Admin takes action (approve/reject)
5. System sends notification back to user

## Real-time Updates

- Notifications use Firebase real-time listeners
- Updates appear instantly without page refresh
- Unread count updates automatically
- New notifications appear at top of list

## Usage Examples

### Sending Notification from App to Admin
```javascript
import NotificationService from '@/lib/notificationService';

// When user creates new listing
await NotificationService.notifyNewListing({
  id: 'listing123',
  title: 'Beautiful House',
  ownerName: 'John Doe',
  userId: 'user123'
});
```

### Sending Notification from Admin to User
```javascript
// When admin approves listing
await NotificationService.notifyListingStatusChange(listing, 'approved');
```

### Testing Notifications
```javascript
// Use TestNotificationButton component
<TestNotificationButton />
```

## Security Rules

### Firestore Rules
```javascript
// Allow users to read their own notifications
match /notifications/{notificationId} {
  allow read, write: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     resource.data.userId == 'admin');
}
```

## Performance Considerations

- Notifications are limited to 100 per user
- Old notifications are automatically cleaned up
- Real-time listeners are optimized for minimal data transfer
- Unread count is calculated client-side for performance

## Error Handling

- Failed notifications are logged but don't break user flow
- Toast notifications show success/error messages
- Fallback to mock data if Firebase is unavailable
- Graceful degradation for offline scenarios

## Future Enhancements

1. **Push Notifications**: Integrate with FCM for mobile push notifications
2. **Email Notifications**: Send email copies of important notifications
3. **Notification Preferences**: Allow users to customize notification types
4. **Rich Notifications**: Include images and action buttons
5. **Notification History**: Archive old notifications
6. **Bulk Actions**: Mark multiple notifications as read/delete
7. **Notification Templates**: Predefined notification formats
8. **Analytics**: Track notification engagement and effectiveness
