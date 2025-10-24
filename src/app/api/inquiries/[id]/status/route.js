import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

const getNotificationTitle = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'Inquiry Approved!';
    case 'rejected':
      return 'Inquiry Update';
    default:
      return 'Inquiry Status Update';
  }
};

const getNotificationBody = (buyerName, status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return `Great news ${buyerName}! Your inquiry has been approved. We'll be in touch soon.`;
    case 'rejected':
      return `Your inquiry has been reviewed. Unfortunately, it doesn't meet our current criteria.`;
    default:
      return `Your inquiry status has been updated to ${status}.`;
  }
};

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    if (!status || !['approved', 'rejected', 'pending'].includes(status.toLowerCase())) {
      return NextResponse.json({ error: 'Valid status is required (approved, rejected, pending)' }, { status: 400 });
    }

    // Update inquiry status in Firestore
    const inquiryRef = adminDb.collection('inquiries').doc(id);
    const inquiryDoc = await inquiryRef.get();
    
    if (!inquiryDoc.exists) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    const inquiryData = inquiryDoc.data();
    const userId = inquiryData.userId;

    await inquiryRef.update({ 
      status, 
      updatedAt: new Date() 
    });

    // Send notification to user
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;
        const deviceToken = userData.deviceToken;
        const token = fcmToken || deviceToken; // Fallback logic

        if (token) {
          const notificationTitle = getNotificationTitle(status);
          const notificationBody = getNotificationBody(inquiryData.buyerName, status);
          
          const message = {
            token,
            notification: {
              title: notificationTitle,
              body: notificationBody,
            },
            data: {
              type: 'inquiry_status_update',
              inquiryId: id,
              status: status,
              buyerName: inquiryData.buyerName || 'User'
            }
          };

          await adminMessaging.send(message);
          console.log(`Notification sent to user ${userId} for inquiry ${id} using ${fcmToken ? 'fcmToken' : 'deviceToken'}`);
        } else {
          console.log(`No FCM token or device token found for user ${userId}`);
          console.log('Available user data fields:', Object.keys(userData));
        }
      } else {
        console.log(`User document not found for userId ${userId}`);
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    return NextResponse.json({ 
      message: 'Inquiry status updated successfully', 
      status 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json({ error: 'Failed to update inquiry status' }, { status: 500 });
  }
}
