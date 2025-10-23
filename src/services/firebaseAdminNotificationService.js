// Firebase Admin Notification Service
// Uses Firebase Admin SDK for all operations

import { getFirestore, getMessaging, sendNotificationToUser } from "@/lib/firebaseAdmin";

/**
 * Send notification using Firebase Admin SDK
 */
export async function sendFirebaseAdminNotification(userId, notificationData) {
  try {
    console.log("🚀 Firebase Admin: Sending notification to user:", userId);
    console.log("📦 Firebase Admin: Notification data:", notificationData);

    const db = getFirestore();
    const messaging = getMessaging();

    // Get user document
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.error("❌ Firebase Admin: User not found:", userId);
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data();
    
    // Only use mobile FCM token
    const userFCMToken = userData?.mobileFcmToken;

    if (!userFCMToken) {
      console.error("❌ Firebase Admin: Mobile FCM token not found for user:", userId);
      return {
        success: false,
        error: "Mobile FCM token not found. User needs to enable notifications on mobile app.",
      };
    }

    console.log("📱 Firebase Admin: Using FCM token:", userFCMToken.substring(0, 20) + "...");

    // Prepare notification payload
    const notificationPayload = {
      title: notificationData.title,
      body: notificationData.description || notificationData.body,
      data: {
        ...notificationData.data,
        notificationId: notificationData.id,
        userId: userId,
        timestamp: new Date().toISOString(),
        source: "firebase-admin"
      },
    };

    console.log("📤 Firebase Admin: Sending FCM notification with payload:", notificationPayload);

    // Send notification using Firebase Admin
    const result = await sendNotificationToUser(userFCMToken, notificationPayload);

    if (result.success) {
      console.log("✅ Firebase Admin: Notification sent successfully:", result.messageId);
      
      // Also store notification in database for in-app notification list
      try {
        const notificationDoc = {
          userId: userId,
          title: notificationData.title,
          description: notificationData.description || notificationData.body,
          isSeen: false,
          data: notificationData.data || {},
          createdAt: new Date(),
          updatedAt: new Date(),
          source: "firebase-admin",
          pushNotificationId: result.messageId
        };

        const notificationRef = await db.collection("notifications").add(notificationDoc);
        console.log("✅ Firebase Admin: Notification stored in database:", notificationRef.id);
      } catch (dbError) {
        console.error("❌ Firebase Admin: Failed to store notification in database:", dbError);
        // Don't fail the whole operation if database storage fails
      }
      
      return {
        success: true,
        messageId: result.messageId,
        userId: userId,
        fcmToken: userFCMToken.substring(0, 20) + "...",
        source: "firebase-admin",
        storedInDatabase: true
      };
    } else {
      console.error("❌ Firebase Admin: Failed to send notification:", result.error);
      return {
        success: false,
        error: result.error,
      };
    }

  } catch (error) {
    console.error("❌ Firebase Admin: Error in sendFirebaseAdminNotification:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Send notification to multiple users using Firebase Admin SDK
 */
export async function sendFirebaseAdminNotificationToMultipleUsers(userIds, notificationData) {
  console.log("📢 Firebase Admin: Sending notifications to multiple users:", userIds.length);
  
  const promises = userIds.map(userId => 
    sendFirebaseAdminNotification(userId, notificationData)
  );
  
  const results = await Promise.all(promises);
  
  const successCount = results.filter(result => result.success).length;
  const failureCount = results.length - successCount;
  
  console.log(`📊 Firebase Admin: Notification results: ${successCount} success, ${failureCount} failed`);
  
  return {
    success: successCount > 0,
    results: results,
    successCount,
    failureCount,
    source: "firebase-admin"
  };
}

/**
 * Store notification in Firestore using Firebase Admin
 */
export async function storeFirebaseAdminNotification(notificationData) {
  try {
    const db = getFirestore();
    
    const notification = {
      userId: notificationData.userId,
      title: notificationData.title,
      description: notificationData.description,
      isSeen: false,
      data: notificationData.data || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "firebase-admin"
    };

    const docRef = await db.collection("notifications").add(notification);
    
    console.log("✅ Firebase Admin: Notification stored in Firestore:", docRef.id);
    
    return {
      success: true,
      notificationId: docRef.id,
      notification: { id: docRef.id, ...notification }
    };

  } catch (error) {
    console.error("❌ Firebase Admin: Error storing notification:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Complete notification flow: Store + Send using Firebase Admin
 */
export async function sendCompleteFirebaseAdminNotification(userId, notificationData) {
  try {
    console.log("🔄 Firebase Admin: Starting complete notification flow for user:", userId);

    // Step 1: Store notification in Firestore
    const storeResult = await storeFirebaseAdminNotification({
      ...notificationData,
      userId
    });

    if (!storeResult.success) {
      console.error("❌ Firebase Admin: Failed to store notification");
      return storeResult;
    }

    // Step 2: Send push notification
    const pushResult = await sendFirebaseAdminNotification(userId, {
      ...notificationData,
      id: storeResult.notificationId
    });

    return {
      success: pushResult.success,
      notificationId: storeResult.notificationId,
      pushResult: pushResult,
      storeResult: storeResult,
      source: "firebase-admin-complete"
    };

  } catch (error) {
    console.error("❌ Firebase Admin: Error in complete notification flow:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
