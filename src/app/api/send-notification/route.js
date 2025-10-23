import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, notification } = await request.json();


    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use Firebase Admin SDK for all operations
    const { getFirestore } = await import("@/lib/firebaseAdmin");
    const adminApp = (await import("@/lib/firebaseAdmin")).default;

    if (!adminApp) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Firebase Admin not configured. Please check environment variables.",
        },
        { status: 500 }
      );
    }

    const db = getFirestore();

    // Fetch user document
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // ONLY use mobile FCM token for push notifications (ignore web tokens)
    const userFCMToken = userData?.mobileFcmToken;

    if (!userFCMToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mobile FCM token not found. User needs to enable notifications on mobile app.",
        },
        { status: 404 }
      );
    }

    // Send push notification using the new push service
    const { sendPushNotificationToUser } = await import("@/services/pushNotificationService");
    const result = await sendPushNotificationToUser(userId, {
      id: 'api-notification-' + Date.now(),
      title: notification.title,
      description: notification.body,
      data: notification.data
    });

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
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
