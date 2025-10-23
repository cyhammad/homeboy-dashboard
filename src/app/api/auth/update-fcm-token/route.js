import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/firebase-admin-utils';

// POST /api/auth/update-fcm-token - Update user's FCM token
export async function POST(request) {
  try {
    const { fcmToken } = await request.json();

    if (!fcmToken) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    // Get Firebase token from headers
    const authHeader = request.headers.get('x-firebase-token');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Firebase token required' },
        { status: 401 }
      );
    }

    // Verify the Firebase token
    const decodedToken = await verifyIdToken(authHeader);
    const userId = decodedToken.uid;

    console.log(`Updating FCM token for user ${userId}:`, fcmToken);

    // Update user document with new FCM token
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
      fcmToken: fcmToken,
      updatedAt: new Date(),
    });

    console.log(`FCM token updated successfully for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'FCM token updated successfully',
    });

  } catch (error) {
    console.error('Error updating FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to update FCM token', details: error.message },
      { status: 500 }
    );
  }
}
