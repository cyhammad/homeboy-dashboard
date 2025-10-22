"use client";
import { useState, useEffect } from 'react';
import fcmService from '@/lib/fcmService';
import adminNotificationService from '@/lib/adminNotificationService';

const TestFCMPage = () => {
  const [fcmStatus, setFcmStatus] = useState('initializing');
  const [token, setToken] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const initializeFCM = async () => {
      try {
        setFcmStatus('initializing');
        
        // Check if we already have a stored token
        const storedToken = fcmService.getStoredToken();
        if (storedToken) {
          setToken(storedToken);
          setFcmStatus('ready');
          return;
        }

        // Request permission and get new token
        const newToken = await fcmService.requestPermission();
        if (newToken) {
          setToken(newToken);
          setFcmStatus('ready');
        } else {
          setFcmStatus('error');
        }
      } catch (error) {
        console.error('Error initializing FCM:', error);
        setFcmStatus('error');
      }
    };

    initializeFCM();
  }, []);

  const sendTestNotification = async () => {
    try {
      setTestResult('sending...');
      
      const result = await adminNotificationService.notifyListingCreated({
        id: 'test-listing-123',
        title: 'Test Property',
        location: 'Test Location',
        price: 500000,
        ownerName: 'Test Owner'
      });

      if (result.success) {
        setTestResult('success');
      } else {
        setTestResult('error: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResult('error: ' + error.message);
    }
  };

  const sendInquiryTestNotification = async () => {
    try {
      setTestResult('sending...');
      
      const result = await adminNotificationService.notifyInquiryAction({
        id: 'test-inquiry-123',
        listingId: 'test-listing-123',
        listingTitle: 'Test Property',
        customerName: 'Test Customer'
      }, 'approved');

      if (result.success) {
        setTestResult('success');
      } else {
        setTestResult('error: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResult('error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">FCM Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">FCM Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                fcmStatus === 'ready' ? 'bg-green-100 text-green-800' :
                fcmStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {fcmStatus}
              </span>
            </p>
            <p><strong>Token:</strong> 
              <span className="ml-2 text-sm text-gray-600 break-all">
                {token ? token.substring(0, 50) + '...' : 'No token'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Notifications</h2>
          <div className="space-y-4">
            <button
              onClick={sendTestNotification}
              disabled={fcmStatus !== 'ready'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Test Listing Notification
            </button>
            
            <button
              onClick={sendInquiryTestNotification}
              disabled={fcmStatus !== 'ready'}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
            >
              Send Test Inquiry Notification
            </button>
          </div>
          
          {testResult && (
            <div className="mt-4">
              <p><strong>Test Result:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  testResult === 'success' ? 'bg-green-100 text-green-800' :
                  testResult.startsWith('error') ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {testResult}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Make sure you have set up your Firebase project with FCM enabled</p>
            <p>2. Add your VAPID key to the environment variables</p>
            <p>3. Ensure your mobile app is configured to receive FCM notifications</p>
            <p>4. Click the test buttons to send notifications to your mobile app</p>
            <p>5. Check your mobile device for push notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFCMPage;
