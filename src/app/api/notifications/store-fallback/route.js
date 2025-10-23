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


    // DEPRECATED: This endpoint is no longer needed
    // The realtime listener in FirebaseContext.jsx automatically creates notifications
    // when new listings/inquiries are detected in Firestore
    // Returning success without storing to prevent duplicates

    return NextResponse.json({
      success: true,
      message: "Notification will be created automatically by realtime listener",
      deprecated: true
    });

  } catch (error) {
    console.error("❌ Error in fallback endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
