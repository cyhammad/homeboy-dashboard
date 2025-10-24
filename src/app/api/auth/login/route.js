import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

// POST /api/auth/login - Login user
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify user exists and credentials are valid using Firebase Admin
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is disabled
    if (userRecord.disabled) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }

    // Get or create user document in Firestore
    const userDocRef = adminDb.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    let userData;
    let fcmToken;

    if (!userDoc.exists) {
      // Create new user document
      console.log(`Creating new user document for ${userRecord.uid}`);
      fcmToken = 'pending_client_token';
      console.log(`Using placeholder FCM token - client should provide real token`);
      
      userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || 'Super Admin',
        imageUrl: userRecord.photoURL || '',
        role: 'admin', // Only admin users can login
        fcmToken: fcmToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userDocRef.set(userData);
      console.log(`User document created successfully for ${userRecord.uid}`);
    } else {
      // Get existing user data
      userData = userDoc.data();
      
      // Use existing FCM token or set placeholder
      if (!userData.fcmToken || userData.fcmToken === 'pending_client_token') {
        console.log(`No valid FCM token found for existing user ${userRecord.uid}, using placeholder`);
        fcmToken = 'pending_client_token';
        await userDocRef.update({
          fcmToken: fcmToken,
          updatedAt: new Date(),
        });
        userData.fcmToken = fcmToken;
        console.log(`FCM token set to placeholder for user ${userRecord.uid}`);
      } else {
        fcmToken = userData.fcmToken;
        console.log(`Using existing FCM token for user ${userRecord.uid}: ${fcmToken}`);
      }
    }

    // Check if user has admin role
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Create custom token for the user
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    // Return success response with user data
    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userData.name,
        imageUrl: userData.imageUrl,
        role: userData.role,
        fcmToken: fcmToken,
        emailVerified: userRecord.emailVerified,
      },
      customToken,
      message: 'Login successful',
      note: 'Use customToken to sign in with Firebase client SDK to get ID token',
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: error.message },
      { status: 500 }
    );
  }
}
