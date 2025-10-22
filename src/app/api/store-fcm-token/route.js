import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import adminApp from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { userId, fcmToken } = await request.json();

    console.log("🟢 Storing FCM token for user:", userId);
    console.log("📦 FCM token:", fcmToken);

    if (!userId || !fcmToken) {
      return NextResponse.json(
        { success: false, error: "User ID and FCM token are required" },
        { status: 400 }
      );
    }

    if (!adminApp) {
      console.error("❌ Firebase Admin not initialized");
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin not configured. Please check environment variables.",
        },
        { status: 500 }
      );
    }

    const db = getFirestore(adminApp);

    // Update user document with FCM token
    await db.collection("users").doc(userId).set({
      fcmToken: fcmToken,
      lastTokenUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log("✅ FCM token stored successfully for user:", userId);

    return NextResponse.json({
      success: true,
      message: "FCM token stored successfully"
    });

  } catch (error) {
    console.error("❌ Error storing FCM token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store FCM token" },
      { status: 500 }
    );
  }
}