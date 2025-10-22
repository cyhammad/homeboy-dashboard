# Firebase Setup Instructions

This project has been configured to work with Firebase Authentication and Firestore. Follow these steps to complete the setup:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "homeboy-admin-dashboard")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## 3. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

## 5. Enable Cloud Messaging (FCM)

1. In your Firebase project, go to "Cloud Messaging" in the left sidebar
2. Click "Get started" if not already enabled
3. Go to "Cloud Messaging" > "Web configuration"
4. Generate a new Web Push certificate (VAPID key)
5. Copy the VAPID key for later use

## 6. Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following environment variables with your Firebase config values:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Firebase Admin Configuration (for server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
```

Replace the placeholder values with your actual Firebase configuration values.

## 7. Security Rules (Optional)

For production, you should update your Firestore security rules:

1. Go to "Firestore Database" > "Rules"
2. Update the rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/sign-up` to create a new account
3. Navigate to `/login` to sign in with existing credentials
4. Try accessing `/dashboard` without authentication (should redirect to login)

## Features Included

- ✅ Firebase Authentication (Email/Password)
- ✅ User registration with Firestore storage
- ✅ Login/Logout functionality
- ✅ Protected routes
- ✅ Authentication context
- ✅ Form validation
- ✅ Error handling
- ✅ FCM Push Notifications (Web to Mobile)
- ✅ Admin notification system
- ✅ Real-time status updates

## File Structure

```
src/
├── lib/
│   ├── firebase.js          # Firebase configuration
│   └── auth.js              # Authentication utilities
├── context/
│   └── AuthContext.jsx      # Authentication context
└── components/
    └── ProtectedRoute.jsx   # Route protection component
```

## Troubleshooting

- Make sure all environment variables are correctly set
- Check that Firebase Authentication and Firestore are enabled
- Verify that your Firebase project is active
- Check the browser console for any error messages

## Next Steps

- Customize the authentication flow as needed
- Add more user fields to the registration form
- Implement password reset functionality
- Add social authentication (Google, Facebook, etc.)
- Set up proper Firestore security rules for production
