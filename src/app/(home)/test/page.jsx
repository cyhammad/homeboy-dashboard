"use client";

import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, onForegroundMessage, showNotification } from '@/lib/fcm-client-safe';

const TestPage = () => {
  const [permission, setPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [serverFcmToken, setServerFcmToken] = useState(null);

  // Check notification permission on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Set up foreground message listener
  useEffect(() => {
    // Only set up listener on client side
    if (typeof window !== 'undefined') {
      onForegroundMessage((payload) => {
        console.log('Foreground message received:', payload);
        setNotification(payload);
        showNotification(payload);
      });
    }
  }, []);

  // Load debug info on component mount
  useEffect(() => {
    loadDebugInfo();
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        setMessage('Notification permission granted and FCM token obtained!');
        
        // Update FCM token on server
        await updateFCMTokenOnServer(token);
      } else {
        setMessage('Failed to get FCM token. Please check console for errors.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setMessage('Error requesting notification permission');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFCMTokenOnServer = async (token) => {
    try {
      const response = await fetch('/api/auth/update-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-token': document.cookie
            .split('; ')
            .find(row => row.startsWith('firebase-token='))
            ?.split('=')[1] || '',
        },
        body: JSON.stringify({ fcmToken: token }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('FCM token updated on server:', data.message);
        setMessage(prev => prev + ' FCM token updated on server!');
      } else {
        console.error('Failed to update FCM token on server:', data.error);
        setMessage(prev => prev + ' (Warning: Failed to update server)');
      }
    } catch (error) {
      console.error('Error updating FCM token on server:', error);
      setMessage(prev => prev + ' (Warning: Failed to update server)');
    }
  };

  const handleSendTestNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test push notification from Homeboy Dashboard!',
          data: {
            type: 'test',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Notification sent successfully! ${data.message}`);
      } else {
        setMessage(`Failed to send notification: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('Error sending notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCustomNotification = async () => {
    const title = prompt('Enter notification title:');
    const body = prompt('Enter notification body:');
    
    if (!title || !body) {
      setMessage('Title and body are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          data: {
            type: 'custom',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Custom notification sent successfully! ${data.message}`);
      } else {
        setMessage(`Failed to send notification: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('Error sending notification');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDebugInfo = async () => {
    try {
      // First try simple debug
      const simpleResponse = await fetch('/api/debug-simple');
      const simpleData = await simpleResponse.json();
      console.log('Simple debug info:', simpleData);

      // Then try user debug
      const response = await fetch('/api/debug-user');
      const data = await response.json();
      
      if (response.ok) {
        setDebugInfo(data.user);
        setServerFcmToken(data.user.fcmToken);
        console.log('Debug info loaded:', data.user);
      } else {
        console.error('Failed to load debug info:', data.error);
        setMessage(`Debug failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error loading debug info:', error);
      setMessage(`Debug error: ${error.message}`);
    }
  };

  const handleSendToCurrentUser = async () => {
    if (!debugInfo?.uid) {
      setMessage('No user ID available');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Direct Test Notification',
          body: `This is a direct test notification for ${debugInfo.name}!`,
          data: {
            type: 'direct-test',
            userId: debugInfo.uid,
            timestamp: new Date().toISOString(),
          },
          targetUser: debugInfo.uid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Direct notification sent successfully! ${data.message}`);
      } else {
        setMessage(`Failed to send direct notification: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending direct notification:', error);
      setMessage('Error sending direct notification');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage('');
    setNotification(null);
  };

  return (
    <div className="min-h-screen px-8 py-4 font-sora">
      <div className="flex flex-col gap-6">
        {/* Page Title */}
        <div className="flex flex-col gap-1 py-2">
          <p className="text-2xl font-bold text-new-black">Push Notification Test</p>
          <p className="text-new-grey text-sm">
            <span className="text-primary">Test</span> / Push Notifications
          </p>
        </div>

        {/* Permission Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Permission Status</h3>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              permission === 'granted' ? 'bg-green-100 text-green-800' :
              permission === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {permission === 'granted' ? 'Granted' :
               permission === 'denied' ? 'Denied' : 'Not Requested'}
            </div>
            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-50"
              >
                {isLoading ? 'Requesting...' : 'Request Permission'}
              </button>
            )}
          </div>
        </div>

        {/* FCM Token */}
        {fcmToken && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Client FCM Token</h3>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-sm break-all">{fcmToken}</code>
            </div>
          </div>
        )}

        {/* Server FCM Token */}
        {serverFcmToken && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Server FCM Token (from Firestore)</h3>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-sm break-all">{serverFcmToken}</code>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {debugInfo.uid}</p>
              <p><strong>Email:</strong> {debugInfo.email}</p>
              <p><strong>Name:</strong> {debugInfo.name}</p>
              <p><strong>Role:</strong> {debugInfo.role}</p>
              <p><strong>Has FCM Token:</strong> {debugInfo.hasFCMToken ? 'Yes' : 'No'}</p>
              <p><strong>FCM Token Length:</strong> {debugInfo.fcmTokenLength}</p>
              <p><strong>Created:</strong> {new Date(debugInfo.createdAt?.seconds * 1000).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(debugInfo.updatedAt?.seconds * 1000).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Test Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Test Push Notifications</h3>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleSendTestNotification}
              disabled={isLoading || permission !== 'granted'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </button>
            
            <button
              onClick={handleSendCustomNotification}
              disabled={isLoading || permission !== 'granted'}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Custom Notification'}
            </button>

            <button
              onClick={handleSendToCurrentUser}
              disabled={isLoading || !serverFcmToken}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send to Current User'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <p className="text-blue-800">{message}</p>
              <button
                onClick={clearMessage}
                className="text-blue-600 hover:text-blue-800 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Received Notifications */}
        {notification && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-green-800">Received Notification</h3>
            <div className="text-green-700">
              <p><strong>Title:</strong> {notification.notification?.title}</p>
              <p><strong>Body:</strong> {notification.notification?.body}</p>
              {notification.data && (
                <p><strong>Data:</strong> {JSON.stringify(notification.data)}</p>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Click "Request Permission" to allow notifications</li>
            <li>Once permission is granted, you'll see your FCM token</li>
            <li>Click "Send Test Notification" to send a test notification</li>
            <li>Click "Send Custom Notification" to create a custom notification</li>
            <li>Notifications will appear in your browser and system</li>
            <li>Check the console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
