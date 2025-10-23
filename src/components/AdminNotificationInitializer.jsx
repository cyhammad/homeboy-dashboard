"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import clientNotificationService from '@/lib/clientNotificationService';

const AdminNotificationInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize admin notification service with current user ID
    if (user?.uid) {
      clientNotificationService.setAdminUserId(user.uid);
    } else {
      // Fallback: use 'admin' as default
      clientNotificationService.setAdminUserId('admin');
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default AdminNotificationInitializer;
