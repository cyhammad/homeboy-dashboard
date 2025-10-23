import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateFCMToken } from '@/lib/fcm-utils';

// POST /api/auth/register - Register new user
export async function POST(request) {
  try {
    const { email, password, displayName, photoURL } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Only allow admin@homeboy.com to register
    if (email !== 'admin@homeboy.com') {
      return NextResponse.json(
        { error: 'Only admin@homeboy.com is allowed to register' },
        { status: 403 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      displayName: 'Super Admin',
      photoURL: '',
      emailVerified: false,
    });

    // Generate FCM token
    const fcmToken = await generateFCMToken(userRecord.uid);

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: 'Super Admin',
      imageUrl: '',
      role: 'admin',
      fcmToken: fcmToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userData);

    // Create custom token for immediate login
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

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
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
