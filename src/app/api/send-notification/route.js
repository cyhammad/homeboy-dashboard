import { NextResponse } from "next/server";
import { sendNotificationToUser } from "@/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import adminApp from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { userId, notification } = await request.json();

    console.log("🟢 Sending notification to user:", userId);
    console.log("📦 Notification data:", notification);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!adminApp) {
      console.error("❌ Firebase Admin not initialized");
      return NextResponse.json(
        {
          success: false,
          error:
            "Firebase Admin not configured. Please check environment variables.",
        },
        { status: 500 }
      );
    }

    const db = getFirestore(adminApp);

    // Fetch user document
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userFCMToken = userData?.fcmToken;

    if (!userFCMToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "User FCM token not found. User needs to enable notifications.",
        },
        { status: 404 }
      );
    }

    // Send push notification
    const result = await sendNotificationToUser(userFCMToken, notification);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Notification sent successfully",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
