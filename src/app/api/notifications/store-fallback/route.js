import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { userId, notification } = await request.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { error: "User ID and notification data are required" },
        { status: 400 }
      );
    }

    console.log("💾 Storing fallback notification for user:", userId);

    // Use Firebase Admin SDK
    const db = getFirestore();

    // Store notification in database
    const notificationDoc = {
      userId: userId,
      title: notification.title,
      description: notification.description,
      type: notification.type || 'general',
      data: notification.data || {},
      isSeen: false,
      read: false,
      source: notification.source || 'fallback-storage',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const notificationRef = await db.collection("notifications").add(notificationDoc);

    console.log("✅ Fallback notification stored:", notificationRef.id);

    return NextResponse.json({
      success: true,
      message: "Fallback notification stored successfully",
      notificationId: notificationRef.id
    });

  } catch (error) {
    console.error("❌ Error storing fallback notification:", error);
    return NextResponse.json(
      { error: "Failed to store fallback notification" },
      { status: 500 }
    );
  }
}
