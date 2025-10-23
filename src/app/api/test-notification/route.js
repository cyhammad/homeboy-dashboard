import { NextResponse } from "next/server";
import { createNotification } from "@/lib/firebaseUtils";

export async function POST(request) {
  try {
    const { type, title, description } = await request.json();

    const notification = await createNotification({
      title: title || "Test Notification",
      description: description || "This is a test notification",
      userId: 'admin',
      type: type || 'test',
      data: {
        type: type || 'test',
        source: 'manual-test',
        timestamp: new Date().toISOString()
      },
      isSeen: false
    });

    console.log('Test notification created:', notification);

    return NextResponse.json({
      success: true,
      notification: notification
    });

  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: "Failed to create test notification" },
      { status: 500 }
    );
  }
}
