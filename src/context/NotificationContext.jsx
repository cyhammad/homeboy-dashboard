"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import deviceTokenService from '@/lib/deviceTokenService';
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
  const [deviceToken, setDeviceToken] = useState(null);
  const [permission, setPermission] = useState('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Initialize device token when component mounts
  useEffect(() => {
    const initializeDeviceToken = async () => {
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
          // Generate a device token for this browser session
          const token = await generateDeviceToken();
          if (token) {
            setDeviceToken(token);
            
            // Store device token in database
            if (user?.uid) {
              await storeDeviceTokenInDatabase(token, user.uid);
            }
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing device token:', error);
        setIsInitialized(true);
      }
    };

    initializeDeviceToken();
  }, [user]);

  // Generate a device token for this browser session
  const generateDeviceToken = async () => {
    try {
      // Generate a unique device token based on browser fingerprint and timestamp
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: Date.now()
      };
      
      // Create a hash-like token from browser info
      const tokenString = JSON.stringify(browserInfo);
      const token = btoa(tokenString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
      
      console.log('Device token generated:', token);
      return token;
    } catch (error) {
      console.error('Error generating device token:', error);
      return null;
    }
  };

  // Store device token in database
  const storeDeviceTokenInDatabase = async (token, userId) => {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastSeen: new Date().toISOString()
      };

      const result = await deviceTokenService.storeDeviceToken(
        userId, 
        token, 
        'web', 
        deviceInfo
      );
      
      if (result.success) {
        console.log('Device token stored in database for user:', userId);
        return true;
      } else {
        console.error('Failed to store device token:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error storing device token:', error);
      return false;
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    try {
      if (typeof window === 'undefined') return false;
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPermission('granted');
        
        // Generate and store device token
        const token = await generateDeviceToken();
        if (token) {
          setDeviceToken(token);
          
          // Store device token in database
          if (user?.uid) {
            await storeDeviceTokenInDatabase(token, user.uid);
          }
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  // Send notification to user using device token
  const sendNotification = async (userId, notificationData) => {
    try {
      return await deviceTokenService.sendNotificationToUser(userId, notificationData);
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
    deviceToken,
    fcmToken: deviceToken, // Keep backward compatibility
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
