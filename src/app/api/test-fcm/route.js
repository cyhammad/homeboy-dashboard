import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateFCMToken, sendPushNotification } from '@/lib/fcm-utils';

// GET /api/test-fcm - Test FCM token generation and retrieval
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'UID parameter is required' },
        { status: 400 }
      );
    }

    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found in Firestore' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      success: true,
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        fcmToken: userData.fcmToken,
        hasFCMToken: !!userData.fcmToken,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      message: 'FCM token retrieved successfully',
    });

  } catch (error) {
    console.error('FCM test error:', error);
    return NextResponse.json(
      { error: 'FCM test failed', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/test-fcm - Test FCM token generation
export async function POST(request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    // Generate new FCM token
    const fcmToken = await generateFCMToken(uid);
    
    // Update user document with new FCM token
    await adminDb.collection('users').doc(uid).update({
      fcmToken: fcmToken,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      fcmToken: fcmToken,
      message: 'FCM token generated and saved successfully',
    });

  } catch (error) {
    console.error('FCM generation error:', error);
    return NextResponse.json(
      { error: 'FCM generation failed', details: error.message },
      { status: 500 }
    );
  }
}
