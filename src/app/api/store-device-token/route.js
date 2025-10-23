import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, deviceToken, platform = 'mobile', deviceInfo = {} } = await request.json();

    console.log("🟢 Storing device token for user:", userId);
    console.log("📦 Device token:", deviceToken);
    console.log("📱 Platform:", platform);

    if (!userId || !deviceToken) {
      return NextResponse.json(
        { success: false, error: "User ID and device token are required" },
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

    // Store device token with additional metadata
    const updateData = {
      deviceToken: deviceToken,
      platform: platform,
      deviceInfo: {
        ...deviceInfo,
        lastSeen: new Date().toISOString(),
        tokenUpdatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    await db.collection("users").doc(userId).set(updateData, { merge: true });

    console.log(`✅ Device token stored successfully for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Device token stored successfully",
      deviceToken: deviceToken.substring(0, 20) + "..."
    });

  } catch (error) {
    console.error("❌ Error storing device token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store device token" },
      { status: 500 }
    );
  }
}
