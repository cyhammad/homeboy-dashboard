import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

// Helper functions for notification content
const getNotificationTitle = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return '🎉 Listing Approved!';
    case 'rejected':
      return '❌ Listing Rejected';
    case 'pending':
      return '⏳ Listing Status Updated';
    default:
      return '📋 Listing Status Updated';
  }
};

const getNotificationBody = (listingTitle, status) => {
  const title = listingTitle || 'Your listing';
  switch (status.toLowerCase()) {
    case 'approved':
      return `"${title}" has been approved and is now live!`;
    case 'rejected':
      return `"${title}" has been rejected. Please check the requirements and try again.`;
    case 'pending':
      return `"${title}" status has been updated to pending review.`;
    default:
      return `"${title}" status has been updated to ${status}.`;
  }
};

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (approved, pending, or rejected)' },
        { status: 400 }
      );
    }

    const listingRef = adminDb.collection('listings').doc(id);
    
    // Get the listing document to access userId
    const listingDoc = await listingRef.get();
    if (!listingDoc.exists) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listingData = listingDoc.data();
    const userId = listingData.userId;

    // Update the listing status
    await listingRef.update({
      status,
      updatedAt: new Date(),
    });

    // Send notification to the listing owner
    try {
      // Get user document from users collection
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;
        const deviceToken = userData.deviceToken;

        // Try fcmToken first, then deviceToken
        const token = fcmToken || deviceToken;

        if (token) {
          // Prepare notification message
          const notificationTitle = getNotificationTitle(status);
          const notificationBody = getNotificationBody(listingData.title, status);

          const message = {
            token: token,
            notification: {
              title: notificationTitle,
              body: notificationBody,
            },
            data: {
              type: 'listing_status_update',
              listingId: id,
              status: status,
              title: listingData.title,
              timestamp: new Date().toISOString(),
            },
          };

          // Send the notification
          await adminMessaging.send(message);
          console.log(`Notification sent to user ${userId} for listing ${id} using ${fcmToken ? 'fcmToken' : 'deviceToken'}`);
        } else {
          console.log(`No FCM token or device token found for user ${userId}`);
          console.log('Available user data fields:', Object.keys(userData));
        }
      } else {
        console.log(`User document not found for userId ${userId}`);
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      { message: 'Listing status updated successfully', status },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    );
  }
}
