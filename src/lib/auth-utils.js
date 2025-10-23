/**
 * Client-side authentication utilities
 */

/**
 * Logout user by calling logout API and clearing cookies
 */
export async function logout() {
  try {
    // Call logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clear all user cookies on client side
    const cookiesToClear = [
      'firebase-token',
      'user-name',
      'user-email', 
      'user-imageUrl',
      'user-fcmToken',
      'user-role'
    ];

    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; max-age=0; secure; samesite=strict`;
    });
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    // Even if API fails, clear cookies and redirect
    const cookiesToClear = [
      'firebase-token',
      'user-name',
      'user-email', 
      'user-imageUrl',
      'user-fcmToken',
      'user-role'
    ];

    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; max-age=0; secure; samesite=strict`;
    });
    
    window.location.href = '/login';
  }
}

/**
 * Check if user is authenticated by looking for token cookie
 */
export function isAuthenticated() {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('firebase-token=')
  );
  
  return !!tokenCookie && tokenCookie.split('=')[1]?.trim();
}
