"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '@/lib/auth';
import { getUserById, updateUser } from '@/lib/firebaseUtils';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getUserById(firebaseUser.uid);
          
          if (userDoc) {
            setUserData(userDoc);
            // Update last login
            await updateUser(firebaseUser.uid, {
              lastLogin: new Date().toISOString()
            });
          } else {
            // If user document doesn't exist, create it
            console.warn('User document not found in Firestore for:', firebaseUser.uid);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    isAdmin: userData?.isAdmin || false,
    role: userData?.role || null,
    status: userData?.status || null,
    refreshUserData: async () => {
      if (user) {
        try {
          const userDoc = await getUserById(user.uid);
          setUserData(userDoc);
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
