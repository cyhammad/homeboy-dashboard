import admin from "firebase-admin";

let adminApp;
let adminMessaging;
let adminAuth;
let adminFirestore;

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

    // Initialize all Firebase Admin services
    adminMessaging = admin.messaging();
    adminAuth = admin.auth();
    adminFirestore = admin.firestore();
    
  } else {
    adminApp = admin.app();
    adminMessaging = admin.messaging();
    adminAuth = admin.auth();
    adminFirestore = admin.firestore();
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

/**
 * Verify Firebase ID token using Firebase Admin Auth
 */
export async function verifyIdToken(idToken) {
  try {
    if (!adminAuth) {
      throw new Error("Firebase Admin Auth not initialized");
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log("✅ Firebase ID token verified:", decodedToken.uid);
    return { success: true, decodedToken };
  } catch (error) {
    console.error("❌ Error verifying ID token:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user by UID using Firebase Admin Auth
 */
export async function getUserByUid(uid) {
  try {
    if (!adminAuth) {
      throw new Error("Firebase Admin Auth not initialized");
    }

    const userRecord = await adminAuth.getUser(uid);
    console.log("✅ User retrieved:", userRecord.uid);
    return { success: true, user: userRecord };
  } catch (error) {
    console.error("❌ Error getting user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create custom token for user using Firebase Admin Auth
 */
export async function createCustomToken(uid, additionalClaims = {}) {
  try {
    if (!adminAuth) {
      throw new Error("Firebase Admin Auth not initialized");
    }

    const customToken = await adminAuth.createCustomToken(uid, additionalClaims);
    console.log("✅ Custom token created for user:", uid);
    return { success: true, customToken };
  } catch (error) {
    console.error("❌ Error creating custom token:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get Firestore instance
 */
export function getFirestore() {
  if (!adminFirestore) {
    throw new Error("Firebase Admin Firestore not initialized");
  }
  return adminFirestore;
}

/**
 * Get Auth instance
 */
export function getAuth() {
  if (!adminAuth) {
    throw new Error("Firebase Admin Auth not initialized");
  }
  return adminAuth;
}

/**
 * Get Messaging instance
 */
export function getMessaging() {
  if (!adminMessaging) {
    throw new Error("Firebase Admin Messaging not initialized");
  }
  return adminMessaging;
}

export default adminApp;
