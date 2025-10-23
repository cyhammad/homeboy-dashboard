import { NextResponse } from 'next/server';
import { verifyIdToken, getUserByUid, updateDocument } from '@/lib/firebase-admin-utils';

// GET /api/protected/user-profile - Get current user's profile
export async function GET(request) {
  try {
    // Get Firebase token from middleware headers
    const token = request.headers.get('x-firebase-token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user profile from Firebase Auth
    const userProfile = await getUserByUid(userId);
    
    // Get additional profile data from Firestore if needed
    // const profileData = await getDocument('userProfiles', userId);

    return NextResponse.json({
      user: userProfile,
      // profile: profileData,
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/protected/user-profile - Update user profile
export async function PUT(request) {
  try {
    // Get Firebase token from middleware headers
    const token = request.headers.get('x-firebase-token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { displayName, photoURL, preferences } = body;

    // Update user profile in Firestore
    const updateData = {
      displayName,
      photoURL,
      preferences,
      lastUpdated: new Date(),
    };

    await updateDocument('userProfiles', userId, updateData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData,
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile', details: error.message },
      { status: 500 }
    );
  }
}
