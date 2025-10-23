import { NextResponse } from 'next/server';

// GET /api/debug-simple - Simple debug endpoint
export async function GET(request) {
  try {
    // Get all cookies
    const cookieHeader = request.headers.get('cookie');
    const cookies = {};
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        cookies[key] = value;
      });
    }

    // Get all headers
    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return NextResponse.json({
      success: true,
      debug: {
        hasCookieHeader: !!cookieHeader,
        cookies: cookies,
        firebaseToken: cookies['firebase-token'] ? 'Present' : 'Missing',
        userEmail: cookies['user-email'] || 'Missing',
        userRole: cookies['user-role'] || 'Missing',
        headers: Object.keys(headers),
        userAgent: headers['user-agent'] || 'Unknown',
      },
      message: 'Debug information retrieved',
    });

  } catch (error) {
    console.error('Debug simple error:', error);
    return NextResponse.json(
      { error: 'Failed to debug', details: error.message },
      { status: 500 }
    );
  }
}
