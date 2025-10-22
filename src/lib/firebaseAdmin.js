import admin from "firebase-admin";

let adminApp;
let adminMessaging;

try {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!privateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY is missing or invalid");
    }

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
    };

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    adminMessaging = admin.messaging();
    console.log("✅ Firebase Admin initialized successfully");
  } else {
    adminApp = admin.app();
    adminMessaging = admin.messaging();
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error);
}

/**
 * Send FCM notification to a specific user token
 */
export async function sendNotificationToUser(userFCMToken, notificationData) {
  try {
    if (!adminMessaging) {
      console.error("Firebase Admin messaging not initialized");
      return {
        success: false,
        error: "Firebase Admin not configured. Please check environment variables.",
      };
    }

    // Convert all data values to strings (required by FCM)
    const safeData =
      notificationData.data
        ? Object.fromEntries(
            Object.entries(notificationData.data).map(([k, v]) => [k, String(v)])
          )
        : {};

    // ✅ Valid message payload for Admin SDK
    const message = {
      token: userFCMToken,
      notification: {
        title: notificationData.title,
        body: notificationData.body,
      },
      data: {
        ...safeData,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      android: {
        notification: {
          icon: "ic_notification",
          color: "#FF6B35",
          image: notificationData.imageUrl || undefined,
        },
      },
      webpush: {
        notification: {
          icon: notificationData.icon || "/favicon.ico",
          image: notificationData.imageUrl || undefined,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: "default",
          },
        },
      },
    };

    const response = await adminMessaging.send(message);
    console.log("✅ Successfully sent message:", response);

    return { success: true, messageId: response };
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return { success: false, error: error.message };
  }
}

export default adminApp;
