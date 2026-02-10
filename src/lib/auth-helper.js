/**
 * Authentication helper for API routes
 * This file contains utilities for handling authentication in API routes
 * without Edge Runtime compatibility issues
 */

/**
 * Extract and validate Firebase token from request
 * @param {Request} request - Next.js request object
 * @returns {string|null} Firebase token or null
 */
export function getFirebaseToken(request) {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }

  // Try to get token from custom header set by middleware
  const token = request.headers.get('x-firebase-token');
  if (token) {
    return token;
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    return cookies['firebase-token'] || null;
  }

  return null;
}

/**
 * Create authentication error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response} Next.js response object
 */
export function createAuthError(message = 'Authentication required', status = 401) {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: 'AUTH_REQUIRED' 
    }),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create success response with data
 * @param {any} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response} Next.js response object
 */
export function createSuccessResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {any} details - Additional error details
 * @returns {Response} Next.js response object
 */
export function createErrorResponse(message, status = 500, details = null) {
  return new Response(
    JSON.stringify({ 
      error: message,
      details,
      code: 'API_ERROR'
    }),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
