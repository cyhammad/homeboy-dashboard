"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/firebaseUtils';
import { 
  setAuthCookie, 
  getAuthCookie, 
  removeAuthCookie, 
  isAuthenticatedViaCookie,
  validateCookieData 
} from '@/lib/cookies';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state from cookie on first load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated via cookie
        const cookieData = getAuthCookie();
        
        if (cookieData && validateCookieData(cookieData)) {
          console.log('Found valid auth cookie, initializing user state');
          
          // Set user data from cookie
          setUser({
            uid: cookieData.uid,
            email: cookieData.email,
            displayName: cookieData.displayName
          });
          
          setUserData({
            uid: cookieData.uid,
            email: cookieData.email,
            displayName: cookieData.displayName,
            isAdmin: cookieData.isAdmin,
            role: cookieData.role,
            status: cookieData.status
          });
          
          // Update last login in Firestore
          try {
            await updateUser(cookieData.uid, {
              lastLogin: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error updating last login:', error);
          }
        } else {
          console.log('No valid auth cookie found');
          // Clear any invalid cookie
          if (cookieData) {
            removeAuthCookie();
          }
        }
      } catch (error) {
        console.error('Error initializing auth from cookie:', error);
        removeAuthCookie();
      } finally {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getUserById(firebaseUser.uid);
          
          if (userDoc) {
            setUserData(userDoc);
            
            // Set authentication cookie
            setAuthCookie({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || userDoc.displayName,
              isAdmin: userDoc.isAdmin,
              role: userDoc.role,
              status: userDoc.status
            });
            
            // Update last login
            await updateUser(firebaseUser.uid, {
              lastLogin: new Date().toISOString()
            });
          } else {
            console.warn('User document not found in Firestore for:', firebaseUser.uid);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // User signed out, clear cookie and state
        removeAuthCookie();
        setUserData(null);
      }
      
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, [isInitialized]);

  // Logout function that clears cookie and Firebase auth
  const logout = async () => {
    try {
      // Clear cookie first
      removeAuthCookie();
      
      // Clear local state
      setUser(null);
      setUserData(null);
      
      // Sign out from Firebase
      const { logOut } = await import('@/lib/auth');
      await logOut();
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if Firebase logout fails, clear local state
      setUser(null);
      setUserData(null);
      removeAuthCookie();
    }
  };

  const value = {
    user,
    userData,
    loading,
    isAuthenticated: !!user || isAuthenticatedViaCookie(),
    isAdmin: userData?.isAdmin || false,
    role: userData?.role || null,
    status: userData?.status || null,
    logout,
    refreshUserData: async () => {
      if (user) {
        try {
          const userDoc = await getUserById(user.uid);
          setUserData(userDoc);
          
          // Update cookie with fresh data
          setAuthCookie({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userDoc.displayName,
            isAdmin: userDoc.isAdmin,
            role: userDoc.role,
            status: userDoc.status
          });
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
