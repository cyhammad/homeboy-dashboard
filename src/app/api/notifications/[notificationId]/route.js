import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

export async function PATCH(request, { params }) {
  try {
    const { notificationId } = params;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    console.log("📱 Marking notification as seen:", notificationId);

    // Use Firebase Admin SDK
    const db = getFirestore();

    // Update notification to mark as seen
    await db.collection("notifications").doc(notificationId).update({
      isSeen: true,
      updatedAt: new Date()
    });

    console.log("✅ Notification marked as seen:", notificationId);

    return NextResponse.json({
      success: true,
      message: "Notification marked as seen"
    });

  } catch (error) {
    console.error("❌ Error marking notification as seen:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as seen" },
      { status: 500 }
    );
  }
}
