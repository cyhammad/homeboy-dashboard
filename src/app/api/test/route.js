import { NextResponse } from 'next/server';
import { getFirebaseToken, createAuthError, createSuccessResponse } from '@/lib/auth-helper';

// GET /api/test - Test endpoint to verify middleware is working
export async function GET(request) {
  try {
    const token = getFirebaseToken(request);
    
    if (!token) {
      return createAuthError('No authentication token provided');
    }

    return createSuccessResponse({
      message: 'Authentication token received successfully',
      hasToken: !!token,
      tokenLength: token.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Test endpoint error', details: error.message },
      { status: 500 }
    );
  }
}
