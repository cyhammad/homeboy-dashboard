import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import adminApp from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    if (!adminApp) {
      return NextResponse.json({
        success: false,
        error: "Firebase Admin not initialized"
      });
    }

    const db = getFirestore(adminApp);

    // Get admin user data
    const adminDoc = await db.collection("users").doc("admin").get();
    const adminData = adminDoc.exists ? adminDoc.data() : null;

    // Get all users with FCM tokens
    const usersSnapshot = await db.collection("users").get();
    const usersWithTokens = [];
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) {
        usersWithTokens.push({
          userId: doc.id,
          fcmToken: data.fcmToken.substring(0, 20) + "...",
          lastTokenUpdate: data.lastTokenUpdate,
          hasToken: true
        });
      }
    });

    return NextResponse.json({
      success: true,
      debug: {
        adminUser: {
          exists: adminDoc.exists,
          hasFcmToken: adminData?.fcmToken ? true : false,
          fcmToken: adminData?.fcmToken ? adminData.fcmToken.substring(0, 20) + "..." : null,
          lastTokenUpdate: adminData?.lastTokenUpdate
        },
        totalUsers: usersSnapshot.size,
        usersWithFcmTokens: usersWithTokens.length,
        usersWithTokens: usersWithTokens,
        environment: {
          hasFirebaseAdmin: !!adminApp,
          hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
          hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
          hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL
        }
      }
    });

  } catch (error) {
    console.error("Debug FCM error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
