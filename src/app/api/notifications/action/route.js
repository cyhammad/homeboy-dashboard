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

    // Create notification action record
    const actionData = {
      action,
      adminId,
      notificationId,
      requestId: notificationData.data?.listingId || notificationId,
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
