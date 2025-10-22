import { NextResponse } from 'next/server';
import { sendNotificationToUser } from '@/lib/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import adminApp from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { userId, message } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Initialize Firestore Admin SDK
    const db = getFirestore(adminApp);
    
    // Get the user's FCM token from the database
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userFCMToken = userData.fcmToken;

    if (!userFCMToken) {
      return NextResponse.json(
        { success: false, error: 'User FCM token not found. User needs to enable notifications.' },
        { status: 404 }
      );
    }

    // Create test notification
    const notification = {
      title: 'Test Notification',
      body: message || 'This is a test notification from admin dashboard',
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'admin-dashboard-test'
      }
    };

    // Send the notification
    const result = await sendNotificationToUser(userFCMToken, notification);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test notification sent successfully',
        messageId: result.messageId,
        notification: notification
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
