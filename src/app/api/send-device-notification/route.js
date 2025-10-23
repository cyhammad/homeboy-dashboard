import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, notification } = await request.json();

    console.log("🟢 Sending device notification to user:", userId);
    console.log("📦 Notification data:", notification);

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
      console.error("❌ Firebase Admin not initialized");
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin not configured. Please check environment variables.",
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
    
    // Use device token for notifications
    const deviceToken = userData?.deviceToken;

    if (!deviceToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Device token not found. User needs to register their device.",
        },
        { status: 404 }
      );
    }

    console.log("📱 Using device token:", deviceToken.substring(0, 20) + "...");

    // Send device notification using Firebase Admin
    const { sendNotificationToUser } = await import("@/lib/firebaseAdmin");
    const result = await sendNotificationToUser(deviceToken, {
      id: 'device-notification-' + Date.now(),
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      icon: notification.icon || '/favicon.ico'
    });

    if (result.success) {
      console.log("✅ Device notification sent successfully:", result.messageId);
      
      // NOTE: Do NOT store notification in database here
      // The realtime listener in FirebaseContext.jsx will handle storing notifications
      // for listings/inquiries from mobile app to prevent duplicates
      
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        userId: userId,
        deviceToken: deviceToken.substring(0, 20) + "...",
        storedInDatabase: false
      });
    } else {
      console.error("❌ Failed to send device notification:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Error sending device notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send device notification" },
      { status: 500 }
    );
  }
}
