"use client";
import React from 'react';
import { useNotifications } from '@/context/NotificationContext';

const NotificationSetup = () => {
  const { 
    permission, 
    isInitialized, 
    requestPermission, 
    isSupported, 
    hasPermission 
  } = useNotifications();

  if (!isSupported()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          Your browser doesn't support notifications
        </p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          Initializing notifications...
        </p>
      </div>
    );
  }

  if (hasPermission()) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm">
          ✅ Notifications enabled - You'll receive updates about your listings
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-800 text-sm font-medium">
            Enable Notifications
          </p>
          <p className="text-gray-600 text-xs">
            Get notified when your listings are approved or rejected
          </p>
        </div>
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Enable
        </button>
      </div>
    </div>
  );
};

export default NotificationSetup;
