import { NextResponse } from "next/server";
import { createNotification } from "@/lib/firebaseUtils";

export async function POST(request) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data are required" },
        { status: 400 }
      );
    }

    // DEPRECATED: This endpoint is no longer needed
    // The realtime listener in FirebaseContext.jsx automatically creates notifications
    // when new listings/inquiries are detected in Firestore
    // Keeping this endpoint for backward compatibility but it now returns success without creating duplicates
    

    return NextResponse.json({
      success: true,
      message: "Notification will be created automatically by realtime listener",
      deprecated: true
    });

  } catch (error) {
    console.error('Error in create-realtime endpoint:', error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
