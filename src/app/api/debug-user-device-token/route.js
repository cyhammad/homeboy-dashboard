import { NextResponse } from "next/server";
import { getFirestore } from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Debug: Checking device token for user:", userId);

    // Use Firebase Admin SDK
    const db = getFirestore();

    // Get user document
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        userId: userId
      });
    }

    const userData = userDoc.data();
    
    // Check for device token
    const deviceToken = userData?.deviceToken;
    const platform = userData?.platform;
    const deviceInfo = userData?.deviceInfo;
    const lastSeen = userData?.deviceInfo?.lastSeen;
    const tokenUpdatedAt = userData?.deviceInfo?.tokenUpdatedAt;

    const debugInfo = {
      userId: userId,
      userExists: true,
      deviceToken: deviceToken ? {
        exists: true,
        length: deviceToken.length,
        preview: deviceToken.substring(0, 20) + "...",
        platform: platform,
        lastSeen: lastSeen,
        tokenUpdatedAt: tokenUpdatedAt,
        deviceInfo: deviceInfo
      } : {
        exists: false
      },
      userData: {
        displayName: userData?.displayName,
        email: userData?.email,
        role: userData?.role,
        isAdmin: userData?.isAdmin,
        createdAt: userData?.createdAt,
        updatedAt: userData?.updatedAt
      }
    };

    console.log("🔍 Debug info for user device token:", debugInfo);

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error("❌ Error debugging user device token:", error);
    return NextResponse.json(
      { error: "Failed to debug user device token" },
      { status: 500 }
    );
  }
}
