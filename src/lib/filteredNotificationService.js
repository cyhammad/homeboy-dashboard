import { createNotification } from './firebaseUtils';

// Filtered Notification Service - Only stores pending request notifications
export class FilteredNotificationService {
  
  // Check if notification should be stored (only pending requests)
  static shouldStoreNotification(notificationData) {
    const title = notificationData.title?.toLowerCase() || '';
    const type = notificationData.type || '';
    const dataType = notificationData.data?.type || '';
    
    // Check if it's a pending listing request
    const isPendingListing = 
      (type === 'listing' || dataType === 'listing' || title.includes('listing')) &&
      (title.includes('new listing request') || 
       title.includes('listing request') ||
       title.includes('new listing'));
    
    // Check if it's a pending inquiry request
    const isPendingInquiry = 
      (type === 'inquiry' || dataType === 'inquiry' || title.includes('inquiry')) &&
      (title.includes('new inquiry') || 
       title.includes('inquiry request') ||
       title.includes('new inquiry request'));
    
    return isPendingListing || isPendingInquiry;
  }

  // Send notification from app to admin (only if it's a pending request)
  static async sendToAdmin(notificationData) {
    try {
      // Only store if it's a pending request notification
      if (!this.shouldStoreNotification(notificationData)) {
        console.log('Skipping non-pending request notification:', notificationData.title);
        return { skipped: true, reason: 'Not a pending request notification' };
      }

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
      
      console.log('Pending request notification sent to admin:', notification);
      return notification;
    } catch (error) {
      console.error('Error sending pending request notification to admin:', error);
      throw error;
    }
  }

  // Send notification from admin to app user (only if it's a pending request)
  static async sendToUser(userId, notificationData) {
    try {
      // Only store if it's a pending request notification
      if (!this.shouldStoreNotification(notificationData)) {
        console.log('Skipping non-pending request notification:', notificationData.title);
        return { skipped: true, reason: 'Not a pending request notification' };
      }

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
      
      console.log('Pending request notification sent to user:', notification);
      return notification;
    } catch (error) {
      console.error('Error sending pending request notification to user:', error);
      throw error;
    }
  }

  // Send notification when new listing is created (PENDING REQUEST - STORE)
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

  // Send notification when new inquiry is created (PENDING REQUEST - STORE)
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

  // Send notification when listing status changes (NOT PENDING - SKIP)
  static async notifyListingStatusChange(listingData, newStatus) {
    console.log('Skipping listing status change notification (not a pending request)');
    return { skipped: true, reason: 'Status change notifications are not stored' };
  }

  // Send notification when inquiry status changes (NOT PENDING - SKIP)
  static async notifyInquiryStatusChange(inquiryData, newStatus) {
    console.log('Skipping inquiry status change notification (not a pending request)');
    return { skipped: true, reason: 'Status change notifications are not stored' };
  }

  // Send notification when new user registers (NOT PENDING - SKIP)
  static async notifyNewUser(userData) {
    console.log('Skipping new user registration notification (not a pending request)');
    return { skipped: true, reason: 'User registration notifications are not stored' };
  }

  // Send system notification (NOT PENDING - SKIP)
  static async notifySystem(message, type = 'info') {
    console.log('Skipping system notification (not a pending request)');
    return { skipped: true, reason: 'System notifications are not stored' };
  }

  // Send bulk notification to all users (NOT PENDING - SKIP)
  static async notifyAllUsers(notificationData) {
    console.log('Skipping bulk notification (not a pending request)');
    return { skipped: true, reason: 'Bulk notifications are not stored' };
  }
}

export default FilteredNotificationService;
