import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { notificationId, action, adminId, requestType, requestId, details } = await request.json();

    if (!notificationId || !action || !adminId) {
      return NextResponse.json(
        { error: "Notification ID, action, and admin ID are required" },
        { status: 400 }
      );
    }

    console.log("📝 Storing notification action:", { notificationId, action, adminId });

    // Use Firebase Admin SDK
    const db = getFirestore();

    // Create action record
    const actionData = {
      notificationId,
      action, // 'approve' or 'reject'
      adminId,
      requestType, // 'listing' or 'inquiry'
      requestId,
      details: details || {},
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    };

    // Store in notification_actions collection
    const actionRef = await db.collection("notification_actions").add(actionData);

    console.log("✅ Notification action stored:", actionRef.id);

    return NextResponse.json({
      success: true,
      message: "Notification action stored successfully",
      actionId: actionRef.id
    });

  } catch (error) {
    console.error("❌ Error storing notification action:", error);
    return NextResponse.json(
      { error: "Failed to store notification action" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const requestType = searchParams.get('requestType');
    const limit = parseInt(searchParams.get('limit')) || 50;

    console.log("📋 Fetching notification actions:", { adminId, requestType, limit });

    // Use Firebase Admin SDK
    const db = getFirestore();

    let query = db.collection("notification_actions");

    // Add filters if provided
    if (adminId) {
      query = query.where("adminId", "==", adminId);
    }
    if (requestType) {
      query = query.where("requestType", "==", requestType);
    }

    // Order by timestamp descending and limit
    query = query.orderBy("timestamp", "desc").limit(limit);

    const snapshot = await query.get();
    const actions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      actions.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
        createdAt: data.createdAt
      });
    });

    console.log(`✅ Found ${actions.length} notification actions`);

    return NextResponse.json({
      success: true,
      actions: actions,
      count: actions.length
    });

  } catch (error) {
    console.error("❌ Error fetching notification actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification actions" },
      { status: 500 }
    );
  }
}
