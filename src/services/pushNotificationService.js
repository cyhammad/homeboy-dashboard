// Server-side only imports - these will be dynamically imported

/**
 * Send push notification to a specific user via FCM
 * @param {string} userId - User ID to send notification to
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Result object with success status
 */
export async function sendPushNotificationToUser(userId, notification) {
  try {
    // Use Firebase Admin SDK for all operations
    const { getFirestore, getMessaging } = await import("@/lib/firebaseAdmin");
    const adminApp = (await import("@/lib/firebaseAdmin")).default;

    if (!adminApp) {
      return {
        success: false,
        error: "Firebase Admin not configured. Please check environment variables.",
      };
    }

    const db = getFirestore();
    const messaging = getMessaging();

    // Get user document to retrieve FCM token
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data();
    
    // ONLY use mobile FCM token for push notifications (ignore web tokens)
    const userFCMToken = userData?.mobileFcmToken;

    if (!userFCMToken) {
      return {
        success: false,
        error: "Mobile FCM token not found. User needs to enable notifications on mobile app.",
      };
    }

    // Import the FCM sending function
    const { sendNotificationToUser } = await import("@/lib/firebaseAdmin");

    // Prepare notification payload
    const notificationPayload = {
      title: notification.title,
      body: notification.description || notification.body,
      data: {
        ...notification.data,
        notificationId: notification.id,
        userId: userId,
        timestamp: new Date().toISOString(),
      },
    };

    // Send the FCM notification
    const result = await sendNotificationToUser(userFCMToken, notificationPayload);

    if (result.success) {
      return {
        success: true,
        messageId: result.messageId,
        userId: userId,
        fcmToken: userFCMToken.substring(0, 20) + "...",
        storedInDatabase: false
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }

  } catch (error) {
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Send push notification to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {Object} notification - Notification data
 * @returns {Promise<Object[]>} Array of result objects
 */
export async function sendPushNotificationToMultipleUsers(userIds, notification) {
  const promises = userIds.map(userId => 
    sendPushNotificationToUser(userId, notification)
  );
  
  const results = await Promise.all(promises);
  
  return results;
}
