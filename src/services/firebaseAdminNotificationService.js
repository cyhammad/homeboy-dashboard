// Firebase Admin Notification Service
// Uses Firebase Admin SDK for all operations

import { getFirestore, getMessaging, sendNotificationToUser } from "@/lib/firebaseAdmin";

/**
 * Send notification using Firebase Admin SDK
 */
export async function sendFirebaseAdminNotification(userId, notificationData) {
  try {
    const db = getFirestore();
    const messaging = getMessaging();

    // Get user document
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data();
    
    // Only use mobile FCM token
    const userFCMToken = userData?.mobileFcmToken;

    if (!userFCMToken) {
      return {
        success: false,
        error: "Mobile FCM token not found. User needs to enable notifications on mobile app.",
      };
    }

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

    // Send notification using Firebase Admin
    const result = await sendNotificationToUser(userFCMToken, notificationPayload);

    if (result.success) {
      return {
        success: true,
        messageId: result.messageId,
        userId: userId,
        fcmToken: userFCMToken.substring(0, 20) + "...",
        source: "firebase-admin",
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
 * Send notification to multiple users using Firebase Admin SDK
 */
export async function sendFirebaseAdminNotificationToMultipleUsers(userIds, notificationData) {
  const promises = userIds.map(userId => 
    sendFirebaseAdminNotification(userId, notificationData)
  );
  
  const results = await Promise.all(promises);
  
  const successCount = results.filter(result => result.success).length;
  const failureCount = results.length - successCount;
  
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
    
    return {
      success: true,
      notificationId: docRef.id,
      notification: { id: docRef.id, ...notification }
    };

  } catch (error) {
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
    // Step 1: Store notification in Firestore
    const storeResult = await storeFirebaseAdminNotification({
      ...notificationData,
      userId
    });

    if (!storeResult.success) {
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
    return {
      success: false,
      error: error.message
    };
  }
}
