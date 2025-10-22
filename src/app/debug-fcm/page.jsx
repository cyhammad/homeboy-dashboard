"use client";
import { useState, useEffect } from 'react';

const DebugFCMPage = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug-fcm');
      const data = await response.json();
      setDebugData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'admin',
          notification: {
            title: 'Test Notification',
            body: 'This is a test notification from web admin',
            data: { test: true }
          }
        })
      });
      
      const result = await response.json();
      alert(`Test result: ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8">Loading debug data...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">FCM Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin User Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Admin User Status</h2>
            <div className="space-y-2">
              <p><strong>Exists:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  debugData?.debug?.adminUser?.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.debug?.adminUser?.exists ? 'Yes' : 'No'}
                </span>
              </p>
              <p><strong>Has FCM Token:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  debugData?.debug?.adminUser?.hasFcmToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.debug?.adminUser?.hasFcmToken ? 'Yes' : 'No'}
                </span>
              </p>
              <p><strong>FCM Token:</strong> 
                <span className="ml-2 text-sm text-gray-600">
                  {debugData?.debug?.adminUser?.fcmToken || 'None'}
                </span>
              </p>
              <p><strong>Last Token Update:</strong> 
                <span className="ml-2 text-sm text-gray-600">
                  {debugData?.debug?.adminUser?.lastTokenUpdate || 'Never'}
                </span>
              </p>
            </div>
          </div>

          {/* Environment Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
            <div className="space-y-2">
              <p><strong>Firebase Admin:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  debugData?.debug?.environment?.hasFirebaseAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.debug?.environment?.hasFirebaseAdmin ? 'Initialized' : 'Not Initialized'}
                </span>
              </p>
              <p><strong>Project ID:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  debugData?.debug?.environment?.hasProjectId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.debug?.environment?.hasProjectId ? 'Set' : 'Missing'}
                </span>
              </p>
              <p><strong>Private Key:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  debugData?.debug?.environment?.hasPrivateKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.debug?.environment?.hasPrivateKey ? 'Set' : 'Missing'}
                </span>
              </p>
              <p><strong>Client Email:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  debugData?.debug?.environment?.hasClientEmail ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugData?.debug?.environment?.hasClientEmail ? 'Set' : 'Missing'}
                </span>
              </p>
            </div>
          </div>

          {/* Users with FCM Tokens */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Users with FCM Tokens</h2>
            <p><strong>Total Users:</strong> {debugData?.debug?.totalUsers || 0}</p>
            <p><strong>Users with Tokens:</strong> {debugData?.debug?.usersWithFcmTokens || 0}</p>
            
            {debugData?.debug?.usersWithTokens?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Token Details:</h3>
                <div className="space-y-1 text-sm">
                  {debugData.debug.usersWithTokens.map((user, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <p><strong>User:</strong> {user.userId}</p>
                      <p><strong>Token:</strong> {user.fcmToken}</p>
                      <p><strong>Updated:</strong> {user.lastTokenUpdate || 'Unknown'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-4">
              <button
                onClick={sendTestNotification}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send Test Notification to Admin
              </button>
              
              <button
                onClick={fetchDebugData}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Refresh Debug Data
              </button>
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Troubleshooting Guide</h2>
          <div className="space-y-2 text-sm text-yellow-700">
            <p><strong>If Admin User doesn't exist:</strong> Go to /test-fcm and generate a token</p>
            <p><strong>If FCM Token is missing:</strong> Check browser console for errors, ensure VAPID key is set</p>
            <p><strong>If Environment variables are missing:</strong> Check your .env.local file</p>
            <p><strong>If notifications don't reach mobile:</strong> Ensure mobile app uses same Firebase project and has FCM implemented</p>
            <p><strong>If test notification fails:</strong> Check Firebase Admin SDK configuration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugFCMPage;
