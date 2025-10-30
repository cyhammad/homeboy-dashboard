import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const { notificationId, action, adminId } = await request.json();

    if (!notificationId || !action || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validActions = ['approve', 'reject'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the notification document
    const notificationRef = adminDb.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const notificationData = notificationDoc.data();

    // Support both old format (data.listingId) and new format (listingId)
    const listingId = notificationData.listingId || notificationData.data?.listingId;

    // Create notification action record
    const actionData = {
      action,
      adminId,
      notificationId,
      requestId: listingId || notificationId,
      requestType: notificationData.type || 'listing',
      status: action === 'approve' ? 'approved' : 'rejected',
      details: {
        originalNotificationTitle: notificationData.title,
        originalNotificationDescription: notificationData.description,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    };

    await adminDb.collection('notification_actions').add(actionData);

    // Update notification status
    await notificationRef.update({
      'data.status': action === 'approve' ? 'approved' : 'rejected',
      isSeen: true,
      read: true,
      updatedAt: new Date()
    });

    // Create a new notification for feed in requested format
    try {
      const inquirerName = notificationData?.data?.buyerName || notificationData?.data?.ownerName || notificationData?.ownerName || 'User';
      const inquiryId = notificationData?.data?.inquiryId || (actionData.requestType === 'inquiry' ? actionData.requestId : undefined);
      const propertyId = notificationData?.data?.propertyId || notificationData?.data?.listingId || undefined;
      const type = notificationData?.type || actionData.requestType || 'inquiry';
      const title = notificationData?.title || (type === 'inquiry' ? 'New Inquiry' : 'Listing Update');
      const description = notificationData?.description || (type === 'inquiry'
        ? `${inquirerName} is interested in a property`
        : `Request ${actionData.status}`);

      // Determine target userId from the listing/inquiry owner when available
      let targetUserId = notificationData?.userId || notificationData?.data?.userId || '';
      try {
        const listingIdToLookup = propertyId || listingId || notificationData?.data?.listingId;
        if (listingIdToLookup) {
          const listingSnap = await adminDb.collection('listings').doc(listingIdToLookup).get();
          if (listingSnap.exists) {
            const listingData = listingSnap.data();
            targetUserId = listingData?.userId || targetUserId;
          }
        }
      } catch (lookupErr) {
        console.log('Could not resolve listing owner userId:', lookupErr?.message);
      }

      const adminNotificationDoc = {
        createdAt: new Date(),
        updatedAt: new Date(),
        data: notificationData?.data || {},
        inquirerName: inquirerName,
        inquiryId: inquiryId || '',
        propertyId: propertyId || '',
        source: 'admin-action',
        type: type,
        description: description,
        isSeen: false,
        read: false,
        title: title,
        userId: targetUserId || 'user',
      };

      await adminDb.collection('notifications').add(adminNotificationDoc);
    } catch (createErr) {
      console.error('Failed to create admin notification from action:', createErr);
      // Do not fail the action if notification creation fails
    }

    return NextResponse.json({ 
      message: `Notification ${action}d successfully`,
      action,
      status: action === 'approve' ? 'approved' : 'rejected'
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing notification action:', error);
    return NextResponse.json({ error: 'Failed to process notification action' }, { status: 500 });
  }
}
