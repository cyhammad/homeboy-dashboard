import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/firebase-admin-utils';
import { getFirebaseToken } from '@/lib/auth-helper';
import { randomUUID } from 'crypto';

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

// Helper function for Firestore notification description
const getNotificationDescription = (listingTitle, status) => {
  const title = listingTitle || 'your listing';
  switch (status.toLowerCase()) {
    case 'approved':
      return `Your listing "${title}" has been approved and is now live!`;
    case 'rejected':
      return `Your listing "${title}" has been rejected. Please check the requirements and try again.`;
    case 'pending':
      return `Your listing "${title}" status has been updated to pending review.`;
    default:
      return `Your listing "${title}" status has been updated to ${status}.`;
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

    // Get the authenticated user (sender) from token
    let senderId = null;
    try {
      const token = getFirebaseToken(request);
      if (token) {
        const decodedToken = await verifyIdToken(token);
        senderId = decodedToken.uid;
      }
    } catch (tokenError) {
      console.log('Could not verify token for sender ID:', tokenError.message);
      // Continue without sender ID if token verification fails
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
    const receiverId = listingData?.userId; // The listing owner (receiver)

    console.log('Listing data:', { 
      listingId: id, 
      receiverId, 
      listingTitle: listingData?.title,
      currentStatus: listingData?.status,
      newStatus: status 
    });

    if (!receiverId) {
      console.error('⚠️ WARNING: Listing has no userId, cannot create notification');
    }

    // Update the listing status
    await listingRef.update({
      status,
      updatedAt: new Date(),
    });

    console.log(`✅ Listing ${id} status updated to ${status}.`);

    // Create notification document in Firestore
    if (!receiverId) {
      console.error('❌ Cannot create notification: receiverId is missing or empty');
    } else {
      try {
        const notificationId = randomUUID();
        const now = new Date();
        
        const notificationDoc = {
          id: notificationId,
          title: getNotificationTitle(status),
          description: getNotificationDescription(listingData?.title || 'Unknown listing', status),
          listingId: id,
          receiverId: receiverId,
          senderId: senderId || '',
          isSeen: false,
          createdAt: now,
          updatedAt: now,
        };

        console.log('📝 Creating notification document:', {
          notificationId,
          receiverId,
          senderId: senderId || '(none)',
          listingId: id,
          status,
          title: notificationDoc.title,
          description: notificationDoc.description
        });

        const notificationRef = adminDb.collection('notifications').doc(notificationId);
        await notificationRef.set(notificationDoc);
        
        // Verify the document was created
        const createdDoc = await notificationRef.get();
        if (createdDoc.exists) {
          console.log(`✅ Notification document created successfully!`);
          console.log(`   Document ID: ${createdDoc.id}`);
          console.log(`   Document data:`, createdDoc.data());
        } else {
          console.error(`❌ ERROR: Document was not created - verification failed`);
        }
      } catch (notificationDocError) {
        console.error('❌ Error creating notification document:', notificationDocError);
        console.error('Error details:', {
          message: notificationDocError.message,
          stack: notificationDocError.stack,
          receiverId,
          senderId,
          listingId: id,
          status
        });
        // Don't fail the request if notification document creation fails
      }
    }

    // Send FCM notification to the listing owner
    try {
      // Get user document from users collection
      const userDoc = await adminDb.collection('users').doc(receiverId).get();
      
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
          console.log(`FCM notification sent to user ${receiverId} for listing ${id} using ${fcmToken ? 'fcmToken' : 'deviceToken'}`);
        } else {
          console.log(`No FCM token or device token found for user ${receiverId}`);
          console.log('Available user data fields:', Object.keys(userData));
        }
      } else {
        console.log(`User document not found for userId ${receiverId}`);
      }
    } catch (notificationError) {
      console.error('Error sending FCM notification:', notificationError);
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
