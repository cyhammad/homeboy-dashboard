// Cookie utility functions for authentication persistence

const COOKIE_NAME = 'homeboy_admin_auth';
const COOKIE_EXPIRY_DAYS = 7; // 7 days

// Set authentication cookie
export const setAuthCookie = (userData) => {
  try {
    const cookieData = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      isAdmin: userData.isAdmin,
      role: userData.role,
      status: userData.status,
      timestamp: Date.now()
    };

    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS);

    const cookieString = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(cookieData))}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
    
    document.cookie = cookieString;
    return true;
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return false;
  }
};

// Get authentication cookie
export const getAuthCookie = () => {
  try {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );

    if (!authCookie) return null;

    const cookieValue = authCookie.split('=')[1];
    const decodedValue = decodeURIComponent(cookieValue);
    const userData = JSON.parse(decodedValue);

    // Check if cookie is expired
    const now = Date.now();
    const cookieAge = now - userData.timestamp;
    const maxAge = COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    if (cookieAge > maxAge) {
      removeAuthCookie();
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error getting auth cookie:', error);
    return null;
  }
};

// Remove authentication cookie
export const removeAuthCookie = () => {
  try {
    if (typeof document === 'undefined') return false;
    
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
    return true;
  } catch (error) {
    console.error('Error removing auth cookie:', error);
    return false;
  }
};

// Check if user is authenticated via cookie
export const isAuthenticatedViaCookie = () => {
  const cookieData = getAuthCookie();
  return cookieData !== null && cookieData.uid && cookieData.isAdmin;
};

// Validate cookie data structure
export const validateCookieData = (cookieData) => {
  if (!cookieData) return false;
  
  const requiredFields = ['uid', 'email', 'isAdmin', 'role'];
  return requiredFields.every(field => cookieData.hasOwnProperty(field));
};

// Get cookie expiry time
export const getCookieExpiry = () => {
  const cookieData = getAuthCookie();
  if (!cookieData) return null;
  
  const expiryTime = cookieData.timestamp + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  return new Date(expiryTime);
};

// Check if cookie will expire soon (within 1 day)
export const isCookieExpiringSoon = () => {
  const expiry = getCookieExpiry();
  if (!expiry) return false;
  
  const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return expiry <= oneDayFromNow;
};
