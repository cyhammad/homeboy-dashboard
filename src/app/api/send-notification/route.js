import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendPushNotification } from '@/lib/fcm-utils';

// POST /api/send-notification - Send push notification
export async function POST(request) {
  try {
    const { title, body, data, targetUser } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    let fcmToken;
    
    if (targetUser) {
      // Send to specific user
      const userDoc = await adminDb.collection('users').doc(targetUser).get();
      
      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'Target user not found' },
          { status: 404 }
        );
      }
      
      fcmToken = userDoc.data().fcmToken;
      
      if (!fcmToken || fcmToken === 'pending_client_token' || fcmToken.startsWith('placeholder_')) {
        return NextResponse.json(
          { error: 'User does not have a valid FCM token. Please request notification permission first.' },
          { status: 400 }
        );
      }
    } else {
      // Send to all admin users
      const usersSnapshot = await adminDb.collection('users')
        .where('role', '==', 'admin')
        .get();
      
      if (usersSnapshot.empty) {
        return NextResponse.json(
          { error: 'No admin users found' },
          { status: 404 }
        );
      }
      
      // Send to all admin users
      const results = [];
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.fcmToken && 
            userData.fcmToken !== 'pending_client_token' && 
            !userData.fcmToken.startsWith('placeholder_')) {
          const result = await sendPushNotification(userData.fcmToken, {
            title,
            body,
            data: data || {},
          });
          results.push({
            uid: userData.uid,
            email: userData.email,
            success: result,
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Notification sent to ${results.length} admin users`,
        results: results,
      });
    }

    // Send to specific user
    const success = await sendPushNotification(fcmToken, {
      title,
      body,
      data: data || {},
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
        targetUser: targetUser,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}
