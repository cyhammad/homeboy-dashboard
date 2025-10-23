// Server-side only imports - these will be dynamically imported

/**
 * Send push notification to a specific user via FCM
 * @param {string} userId - User ID to send notification to
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} Result object with success status
 */
export async function sendPushNotificationToUser(userId, notification) {
  try {
    console.log("🚀 Sending push notification to user:", userId);
    console.log("📦 Notification data:", notification);

    // Use Firebase Admin SDK for all operations
    const { getFirestore, getMessaging } = await import("@/lib/firebaseAdmin");
    const adminApp = (await import("@/lib/firebaseAdmin")).default;

    if (!adminApp) {
      console.error("❌ Firebase Admin not initialized");
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
      console.error("❌ User not found:", userId);
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data();
    
    // ONLY use mobile FCM token for push notifications (ignore web tokens)
    const userFCMToken = userData?.mobileFcmToken;

    if (!userFCMToken) {
      console.error("❌ Mobile FCM token not found for user:", userId);
      return {
        success: false,
        error: "Mobile FCM token not found. User needs to enable notifications on mobile app.",
      };
    }

    console.log("📱 Using FCM token:", userFCMToken.substring(0, 20) + "...");

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

    console.log("📤 Sending FCM notification with payload:", notificationPayload);

    // Send the FCM notification
    const result = await sendNotificationToUser(userFCMToken, notificationPayload);

    if (result.success) {
      console.log("✅ Push notification sent successfully:", result.messageId);
      
      // Also store notification in database for in-app notification list
      try {
        const notificationDoc = {
          userId: userId,
          title: notification.title,
          description: notification.description || notification.body,
          isSeen: false,
          data: notification.data || {},
          createdAt: new Date(),
          updatedAt: new Date(),
          source: "web-admin",
          pushNotificationId: result.messageId
        };

        const notificationRef = await db.collection("notifications").add(notificationDoc);
        console.log("✅ Notification stored in database:", notificationRef.id);
      } catch (dbError) {
        console.error("❌ Failed to store notification in database:", dbError);
        // Don't fail the whole operation if database storage fails
      }
      
      return {
        success: true,
        messageId: result.messageId,
        userId: userId,
        fcmToken: userFCMToken.substring(0, 20) + "...",
        storedInDatabase: true
      };
    } else {
      console.error("❌ Failed to send push notification:", result.error);
      return {
        success: false,
        error: result.error,
      };
    }

  } catch (error) {
    console.error("❌ Error in sendPushNotificationToUser:", error);
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
  console.log("📢 Sending push notifications to multiple users:", userIds.length);
  
  const promises = userIds.map(userId => 
    sendPushNotificationToUser(userId, notification)
  );
  
  const results = await Promise.all(promises);
  
  const successCount = results.filter(result => result.success).length;
  const failureCount = results.length - successCount;
  
  console.log(`📊 Push notification results: ${successCount} success, ${failureCount} failed`);
  
  return results;
}
