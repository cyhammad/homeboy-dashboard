import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin-utils';

// POST /api/auth/verify - Verify Firebase ID token
export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(idToken);

    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        customClaims: decodedToken.customClaims || {},
      },
      message: 'Token verified successfully',
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed', details: error.message },
      { status: 401 }
    );
  }
}
