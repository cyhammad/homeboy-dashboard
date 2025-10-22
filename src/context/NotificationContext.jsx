"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import fcmService from '@/lib/fcmService';
import { useAuth } from '@/context/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Initialize FCM when component mounts
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        // Check if we're in browser
        if (typeof window === 'undefined') {
          setIsInitialized(true);
          return;
        }

        // Check if notifications are supported
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          setIsInitialized(true);
          return;
        }

        // Check current permission status
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        if (currentPermission === 'granted') {
          // Initialize FCM and get token
          const token = await fcmService.initializeFCM();
          if (token) {
            setFcmToken(token);
            
            // Store token in database (you might want to call an API here)
            await storeTokenInDatabase(token);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing FCM:', error);
        setIsInitialized(true);
      }
    };

    initializeFCM();
  }, []);

  // Store FCM token in database
  const storeTokenInDatabase = async (token) => {
    try {
      if (typeof window === 'undefined') return;
      
      console.log('Storing FCM token:', token);
      
      // Store FCM token in database
      const response = await fetch('/api/store-fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.uid || 'admin', // Use current user ID
          fcmToken: token 
        })
      });

      if (response.ok) {
        console.log('FCM token stored successfully');
      } else {
        console.error('Failed to store FCM token');
      }
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    try {
      if (typeof window === 'undefined') return false;
      
      const token = await fcmService.requestPermission();
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        
        // Store token in database
        await storeTokenInDatabase(token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  // Send notification to user
  const sendNotification = async (userId, notificationData) => {
    try {
      return await fcmService.sendNotificationToUser(userId, notificationData);
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  // Check if notifications are supported
  const isSupported = () => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window;
  };

  // Check if permission is granted
  const hasPermission = () => {
    return permission === 'granted';
  };

  const value = {
    fcmToken,
    permission,
    isInitialized,
    requestPermission,
    sendNotification,
    isSupported,
    hasPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
