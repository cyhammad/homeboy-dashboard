import { NextResponse } from 'next/server';

// POST /api/auth/logout - Logout user
export async function POST(request) {
  try {
    // Create response with cookie removal
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Remove all user-related cookies
    const cookiesToClear = [
      'firebase-token',
      'user-name',
      'user-email', 
      'user-imageUrl',
      'user-fcmToken',
      'user-role'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        path: '/',
        maxAge: 0,
        secure: true,
        sameSite: 'strict',
      });
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed', details: error.message },
      { status: 500 }
    );
  }
}
