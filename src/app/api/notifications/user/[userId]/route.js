import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

export async function GET(request, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("📱 Fetching notifications for user:", userId);

    // Use Firebase Admin SDK
    const db = getFirestore();

    // Get notifications for the user (without ordering to avoid index requirement)
    const notificationsSnapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .limit(50)
      .get();

    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings for mobile app
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });

    // Sort by createdAt in descending order (newest first) on client side
    notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    console.log(`✅ Found ${notifications.length} notifications for user ${userId}`);

    return NextResponse.json({
      success: true,
      notifications: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
