"use client";
import { useEffect, useState } from 'react';
import fcmService from '@/lib/fcmService';

const AdminFCMInitializer = () => {
  const [fcmStatus, setFcmStatus] = useState('initializing');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeFCM = async () => {
      try {
        setFcmStatus('initializing');
        
        // Check if we already have a stored token
        const storedToken = fcmService.getStoredToken();
        if (storedToken) {
          setToken(storedToken);
          setFcmStatus('ready');
          console.log('Using stored FCM token');
          return;
        }

        // Request permission and get new token
        const newToken = await fcmService.requestPermission();
        if (newToken) {
          setToken(newToken);
          setFcmStatus('ready');
          console.log('FCM initialized successfully');
        } else {
          setFcmStatus('error');
          console.log('FCM initialization failed');
        }
      } catch (error) {
        console.error('Error initializing FCM:', error);
        setFcmStatus('error');
      }
    };

    initializeFCM();
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    if (fcmStatus === 'ready') {
      fcmService.onMessage((payload) => {
        console.log('Received foreground message:', payload);
        // You can add custom handling here if needed
      });
    }
  }, [fcmStatus]);

  // Don't render anything visible
  return null;
};

export default AdminFCMInitializer;
