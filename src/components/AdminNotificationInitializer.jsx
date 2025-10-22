"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import adminNotificationService from '@/lib/adminNotificationService';

const AdminNotificationInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize admin notification service with current user ID
    if (user?.uid) {
      adminNotificationService.setAdminUserId(user.uid);
    } else {
      // Fallback: use 'admin' as default
      adminNotificationService.setAdminUserId('admin');
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default AdminNotificationInitializer;
