import { createNotification } from './firebaseUtils';

// Server-side push notification function using Firebase Admin
async function sendPushNotification(userId, notification) {
  if (typeof window !== "undefined") {
    return false;
  }
  try {
    // Use Firebase Admin notification service
    const { sendFirebaseAdminNotification } = await import(
      "@/services/firebaseAdminNotificationService"
    );
    return await sendFirebaseAdminNotification(userId, notification);
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

// Notification service for sending notifications between app and admin
export class NotificationService {
  
  // Send notification from app to admin
  static async sendToAdmin(notificationData) {
    try {
      const notification = await createNotification({
        title: notificationData.title,
        description: notificationData.description,
        userId: 'admin', // Always send to admin
        type: notificationData.type || 'general',
        data: {
          ...notificationData.data,
          source: 'app',
          timestamp: new Date().toISOString()
        },
        isSeen: false
      });
      
      // Send push notification to admin's mobile app
      sendPushNotification('admin', {
        id: notification.id,
        title: notificationData.title,
        description: notificationData.description,
        data: notificationData.data
      }).catch((error) => {
        console.error("Failed to send push notification to admin (non-blocking):", error);
      });
      
      console.log('Notification sent to admin:', notification);
      return notification;
    } catch (error) {
      console.error('Error sending notification to admin:', error);
      throw error;
    }
  }

  // Send notification from admin to app user
  static async sendToUser(userId, notificationData) {
    try {
      const notification = await createNotification({
        title: notificationData.title,
        description: notificationData.description,
        userId: userId,
        type: notificationData.type || 'general',
        data: {
          ...notificationData.data,
          source: 'admin',
          timestamp: new Date().toISOString()
        },
        isSeen: false
      });
      
      // Send push notification to user's mobile app
      try {
        const pushResult = await sendPushNotification(userId, {
          id: notification.id,
          title: notificationData.title,
          description: notificationData.description,
          data: notificationData.data
        });
        
        if (!pushResult) {
          console.warn("Push notification failed for user:", userId, "but notification was stored in database");
        }
      } catch (pushError) {
        console.error("Failed to send push notification to user (non-blocking):", pushError);
        // Don't throw error as notification is still stored in database
      }
      
      console.log('Notification sent to user:', notification);
      return notification;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  // Send notification when new listing is created
  static async notifyNewListing(listingData) {
    return this.sendToAdmin({
      title: "New Listing Request",
      description: `${listingData.ownerName || 'Property Owner'} submitted a new property listing`,
      type: "listing",
      data: {
        type: "listing",
        listingId: listingData.id,
        ownerName: listingData.ownerName,
        propertyTitle: listingData.title
      }
    });
  }

  // Send notification when listing status changes
  static async notifyListingStatusChange(listingData, newStatus) {
    return this.sendToUser(listingData.userId, {
      title: `Listing ${newStatus}`,
      description: `Your property listing "${listingData.title}" has been ${newStatus}`,
      type: "listing_status",
      data: {
        type: "listing_status",
        listingId: listingData.id,
        status: newStatus,
        propertyTitle: listingData.title
      }
    });
  }

  // Send notification when new inquiry is created
  static async notifyNewInquiry(inquiryData) {
    return this.sendToAdmin({
      title: "New Inquiry",
      description: `${inquiryData.inquirerName || 'Someone'} is interested in a property`,
      type: "inquiry",
      data: {
        type: "inquiry",
        inquiryId: inquiryData.id,
        inquirerName: inquiryData.inquirerName,
        propertyId: inquiryData.listingId
      }
    });
  }

  // Send notification when inquiry status changes
  static async notifyInquiryStatusChange(inquiryData, newStatus) {
    return this.sendToUser(inquiryData.userId, {
      title: `Inquiry ${newStatus}`,
      description: `Your inquiry has been ${newStatus}`,
      type: "inquiry_status",
      data: {
        type: "inquiry_status",
        inquiryId: inquiryData.id,
        status: newStatus
      }
    });
  }

  // Send notification when new user registers
  static async notifyNewUser(userData) {
    return this.sendToAdmin({
      title: "New User Registration",
      description: `${userData.displayName || 'New user'} has registered`,
      type: "user",
      data: {
        type: "user",
        userId: userData.id,
        userName: userData.displayName,
        userEmail: userData.email
      }
    });
  }

  // Send system notification
  static async notifySystem(message, type = 'info') {
    return this.sendToAdmin({
      title: "System Notification",
      description: message,
      type: "system",
      data: {
        type: "system",
        systemType: type
      }
    });
  }

  // Send bulk notification to all users
  static async notifyAllUsers(notificationData) {
    // This would require getting all user IDs from Firestore
    // For now, we'll just send to admin
    return this.sendToAdmin({
      title: "Broadcast Message",
      description: notificationData.message,
      type: "broadcast",
      data: {
        type: "broadcast",
        message: notificationData.message
      }
    });
  }
}

export default NotificationService;
