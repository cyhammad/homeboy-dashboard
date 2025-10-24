import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/debug-user - Debug current user's FCM token and data
export async function GET(request) {
  try {
    // Get Firebase token from cookies (simpler approach)
    const cookieHeader = request.headers.get('cookie');
    let firebaseToken = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      firebaseToken = cookies['firebase-token'];
    }
    
    if (!firebaseToken) {
      return NextResponse.json(
        { error: 'No Firebase token found in cookies' },
        { status: 401 }
      );
    }

    console.log('Debug: Firebase token found:', firebaseToken.substring(0, 20) + '...');

    // Try to verify the token and get user ID
    let userId;
    try {
      // First try to verify as ID token
      const { verifyIdToken } = await import('@/lib/firebase-admin-utils');
      const decodedToken = await verifyIdToken(firebaseToken);
      userId = decodedToken.uid;
      console.log('Debug: ID token verified, user ID:', userId);
    } catch {
      console.log('Debug: Not an ID token, trying custom token approach');
      
      // If it's a custom token, we need to exchange it for an ID token
      // For now, let's try to get user info from the token payload
      try {
        // Decode the JWT payload without verification (since it's a custom token)
        const payload = JSON.parse(atob(firebaseToken.split('.')[1]));
        userId = payload.uid;
        console.log('Debug: Custom token decoded, user ID:', userId);
      } catch (decodeError) {
        console.error('Debug: Token decode failed:', decodeError);
        return NextResponse.json(
          { error: 'Invalid Firebase token', details: 'Cannot decode token' },
          { status: 401 }
        );
      }
    }

    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User document not found in Firestore' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    console.log('Debug: User data retrieved:', {
      uid: userData.uid,
      email: userData.email,
      hasFCMToken: !!userData.fcmToken,
      fcmTokenLength: userData.fcmToken ? userData.fcmToken.length : 0
    });
    
    return NextResponse.json({
      success: true,
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        fcmToken: userData.fcmToken,
        hasFCMToken: !!userData.fcmToken,
        fcmTokenLength: userData.fcmToken ? userData.fcmToken.length : 0,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      message: 'User data retrieved successfully',
    });

  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json(
      { error: 'Failed to debug user', details: error.message },
      { status: 500 }
    );
  }
}
