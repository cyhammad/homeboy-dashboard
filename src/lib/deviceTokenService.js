// Device Token Service for sending notifications using device tokens
// This service handles device token-based notifications instead of FCM tokens

class DeviceTokenService {
  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  // Send notification using device token
  async sendNotificationToUser(userId, notificationData) {
    try {
      const response = await fetch('/api/send-device-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          notification: {
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data || {},
            icon: notificationData.icon || '/favicon.ico'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Device notification sent successfully to user:', userId, result);
        return result;
      } else {
        const errorData = await response.json();
        console.warn('Device notification failed for user:', userId, errorData.error);
        
        // Even if device notification fails, we should still store the notification in database
        // This ensures the user can see it in their notification list
        try {
          const dbResponse = await fetch('/api/notifications/store-fallback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              notification: {
                title: notificationData.title,
                description: notificationData.body,
                data: notificationData.data || {},
                type: notificationData.data?.type || 'general',
                source: 'device-token-fallback'
              }
            })
          });
          
          if (dbResponse.ok) {
            console.log('Notification stored in database as fallback for user:', userId);
            return { success: true, fallback: true, message: 'Notification stored in database (device notification failed)' };
          }
        } catch (dbError) {
          console.error('Failed to store fallback notification:', dbError);
        }
        
        return { success: false, error: errorData.error, fallback: false };
      }
    } catch (error) {
      console.error('Error sending device notification to user:', error);
      return { success: false, error: error.message, fallback: false };
    }
  }

  // Store device token for a user
  async storeDeviceToken(userId, deviceToken, platform = 'mobile', deviceInfo = {}) {
    try {
      const response = await fetch('/api/store-device-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          deviceToken: deviceToken,
          platform: platform,
          deviceInfo: deviceInfo
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Device token stored successfully for user:', userId);
        return result;
      } else {
        const errorData = await response.json();
        console.error('Failed to store device token:', errorData.error);
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Error storing device token:', error);
      return { success: false, error: error.message };
    }
  }

  // Get device token for a user (for debugging)
  async getDeviceToken(userId) {
    try {
      const response = await fetch(`/api/debug-user-device-token?userId=${userId}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Error getting device token:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const deviceTokenService = new DeviceTokenService();

export default deviceTokenService;
