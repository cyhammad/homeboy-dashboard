"use client";
import React, { useState } from 'react';

const NotificationSender = () => {
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    body: '',
    data: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          notification: {
            title: formData.title,
            body: formData.body,
            data: formData.data ? JSON.parse(formData.data) : {},
            imageUrl: '', // Optional: add image URL
            icon: '/favicon.ico' // Optional: add icon
          }
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Reset form on success
        setFormData({
          userId: '',
          title: '',
          body: '',
          data: ''
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to send notification',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📱 Send Notification to Mobile App</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
            User ID (Mobile App User)
          </label>
          <input
            type="text"
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the mobile app user's ID"
          />
          <p className="text-xs text-gray-500 mt-1">
            This should be the user ID from your mobile app (the one stored in Firestore)
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Notification Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notification title"
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
            Notification Message
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notification message"
          />
        </div>

        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Data (JSON - Optional)
          </label>
          <textarea
            id="data"
            name="data"
            value={formData.data}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='{"type": "order_update", "orderId": "12345"}'
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional JSON data to send with the notification
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Notification to Mobile App'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-md ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className="font-semibold mb-2">
            {result.success ? '✅ Success!' : '❌ Error'}
          </h3>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">📋 How to Use:</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Get the User ID from your mobile app (check Firestore users collection)</li>
          <li>Fill in the notification details</li>
          <li>Click "Send Notification to Mobile App"</li>
          <li>The notification will be delivered to the user's mobile device</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationSender;
