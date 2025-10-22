/**
 * Admin Notification Service
 * Sends FCM push notifications to admin's mobile app when admin actions are performed
 */

import fcmService from './fcmService';

class AdminNotificationService {
  constructor() {
    this.adminUserId = 'admin'; // Admin user ID
    this.fcmService = fcmService;
    
    // Initialize FCM service
    this.initializeFCM();
  }

  // Initialize FCM service
  async initializeFCM() {
    try {
      await this.fcmService.initializeFCM();
      console.log('Admin FCM service initialized');
    } catch (error) {
      console.error('Error initializing admin FCM service:', error);
    }
  }

  /**
   * Set the admin user ID (for compatibility with existing code)
   * @param {string} adminUserId - The admin's user ID
   */
  setAdminUserId(adminUserId) {
    this.adminUserId = adminUserId;
    console.log('Admin user ID set to:', adminUserId);
  }

  /**
   * Send FCM push notification to admin's mobile app
   * @param {Object} notificationData - Notification data
   */
  async sendAdminNotification(notificationData) {
    try {
      // Use FCM service to send notification
      const result = await this.fcmService.sendNotificationToAdmin(notificationData);
      return result;
    } catch (error) {
      console.error('Error sending admin FCM notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify admin about new listing creation
   * @param {Object} listingData - Listing data
   */
  async notifyListingCreated(listingData) {
    return await this.sendAdminNotification({
      title: '🏠 New Listing Created',
      body: `"${listingData.title}" has been created and is pending approval`,
      data: {
        type: 'admin_listing_created',
        listingId: listingData.id,
        title: listingData.title,
        location: listingData.location,
        price: listingData.price,
        ownerName: listingData.ownerName,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Notify admin about listing approval
   * @param {Object} listingData - Listing data
   */
  async notifyListingApproved(listingData) {
    return await this.sendAdminNotification({
      title: '✅ Listing Approved',
      body: `"${listingData.title}" has been approved`,
      data: {
        type: 'admin_listing_approved',
        listingId: listingData.id,
        title: listingData.title,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Notify admin about listing rejection
   * @param {Object} listingData - Listing data
   */
  async notifyListingRejected(listingData) {
    return await this.sendAdminNotification({
      title: '❌ Listing Rejected',
      body: `"${listingData.title}" has been rejected`,
      data: {
        type: 'admin_listing_rejected',
        listingId: listingData.id,
        title: listingData.title,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Notify admin about new listing request
   * @param {Object} listingData - Listing data
   */
  async notifyListingRequest(listingData) {
    return await this.sendAdminNotification({
      title: '📋 New Listing Request',
      body: `New listing request: "${listingData.title}" from ${listingData.ownerName}`,
      data: {
        type: 'admin_listing_request',
        listingId: listingData.id,
        title: listingData.title,
        ownerName: listingData.ownerName,
        location: listingData.location,
        price: listingData.price,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Notify admin about inquiry actions
   * @param {Object} inquiryData - Inquiry data
   * @param {string} action - Action performed (approved/rejected)
   */
  async notifyInquiryAction(inquiryData, action) {
    const actionText = action === 'approved' ? 'Approved' : 'Rejected';
    const emoji = action === 'approved' ? '✅' : '❌';
    
    return await this.sendAdminNotification({
      title: `${emoji} Inquiry ${actionText}`,
      body: `Inquiry for "${inquiryData.listingTitle || 'listing'}" has been ${action}`,
      data: {
        type: `admin_inquiry_${action}`,
        inquiryId: inquiryData.id,
        listingId: inquiryData.listingId,
        listingTitle: inquiryData.listingTitle,
        customerName: inquiryData.customerName,
        action: action,
        timestamp: new Date().toISOString()
      }
    });
  }

}

// Create singleton instance
const adminNotificationService = new AdminNotificationService();

export default adminNotificationService;
