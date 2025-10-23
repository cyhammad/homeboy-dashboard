import { adminMessaging } from './firebase-admin';

/**
 * Generate FCM token for a user (server-side placeholder)
 * Note: Real FCM tokens should be generated on the client side
 * @param {string} uid - User UID
 * @returns {Promise<string>} FCM token
 */
export async function generateFCMToken(uid) {
  try {
    // This is a placeholder - real FCM tokens come from the client
    // The client should call getToken() from Firebase Messaging
    const fcmToken = `placeholder_${uid}_${Date.now()}`;
    
    console.log(`Generated placeholder FCM token for user ${uid}:`, fcmToken);
    console.log('Note: Real FCM tokens should be generated on the client side');
    return fcmToken;
  } catch (error) {
    console.error('Error generating FCM token:', error);
    const fallbackToken = `placeholder_${uid}_${Date.now()}`;
    console.log(`Using fallback FCM token for user ${uid}:`, fallbackToken);
    return fallbackToken;
  }
}

/**
 * Send push notification to a user
 * @param {string} fcmToken - User's FCM token
 * @param {Object} notification - Notification payload
 * @returns {Promise<boolean>} Success status
 */
export async function sendPushNotification(fcmToken, notification) {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
    };

    const response = await adminMessaging.send(message);
    console.log('Successfully sent message:', response);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}
