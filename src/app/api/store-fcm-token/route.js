import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, fcmToken, platform = 'mobile' } = await request.json();

    // Only allow mobile platform tokens
    if (platform !== 'mobile') {
      return NextResponse.json(
        { success: false, error: "Only mobile platform tokens are allowed" },
        { status: 400 }
      );
    }


    if (!userId || !fcmToken) {
      return NextResponse.json(
        { success: false, error: "User ID and FCM token are required" },
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
          error: "Firebase Admin not configured. Please check environment variables.",
        },
        { status: 500 }
      );
    }

    const db = getFirestore();

    // Store only mobile FCM token
    const updateData = {
      mobileFcmToken: fcmToken,
      fcmToken: fcmToken, // Keep backward compatibility
      lastTokenUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection("users").doc(userId).set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Mobile FCM token stored successfully"
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to store FCM token" },
      { status: 500 }
    );
  }
}