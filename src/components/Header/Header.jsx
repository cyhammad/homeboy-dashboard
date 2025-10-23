"use client";
import Image from "next/image";
import UserAvatar from "./useravatar.png";
import DetailsModal from "./DetailsModal";
import BellIcon from "@/assets/icons/Bell";

import { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { useNotifications as useNotificationContext } from "@/context/NotificationContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useListingRequests } from "@/hooks/useListingRequests";
import { useInquiryRequests } from "@/hooks/useInquiryRequests";
import { deleteNotification } from "@/lib/firebaseUtils";
// import NotificationService from "@/lib/notificationService"; // Removed - causes build issues with Firebase Admin
import FilteredNotificationService from "@/lib/filteredNotificationService";
import clientNotificationService from "@/lib/clientNotificationService";
import toast, { Toaster } from "react-hot-toast";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { openModal, closeModal } = useModal();
  const { notifications, unreadCount, markAsRead, formatTimeAgo } = useNotifications();
  const { sendNotification } = useNotificationContext();
  const { updateStatus: updateListingStatus } = useListingRequests();
  const { updateStatus: updateInquiryStatus } = useInquiryRequests();

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowModal(true);
    openModal();
  };

  const [showModal, setShowModal] = useState(false);
  const closeModals = () => {
    setShowModal(false);
    setShowNotifications(false);
    closeModal();
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      // Find the notification to get its data
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        console.error('Notification not found:', notificationId);
        toast.error('Notification not found');
        return;
      }

      const { data } = notification;
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      let successMessage = '';

      // Debug: Log notification data to understand the structure
      console.log('Notification data:', data);
      console.log('Notification full object:', notification);
      console.log('Data type:', typeof data);
      console.log('Data keys:', Object.keys(data || {}));
      console.log('Has listingId:', data?.listingId);
      console.log('Has id:', data?.id);
      console.log('Has type:', data?.type);

      // Handle different types of notifications
      // Check for listing-related notifications
      if ((data?.type === 'listing' || data?.type === 'listing_status') && (data?.listingId || data?.id)) {
        const listingId = data.listingId || data.id;
        console.log(`${action}ing listing:`, listingId);
        await updateListingStatus(listingId, newStatus);
        successMessage = `Listing ${action}d successfully`;
        console.log(`Listing ${listingId} ${action}d successfully`);
      }
      // Check for inquiry-related notifications
      else if ((data?.type === 'inquiry' || data?.type === 'inquiry_status') && (data?.inquiryId || data?.id)) {
        const inquiryId = data.inquiryId || data.id;
        console.log(`${action}ing inquiry:`, inquiryId);
        await updateInquiryStatus(inquiryId, newStatus);
        successMessage = `Inquiry ${action}d successfully`;
        console.log(`Inquiry ${inquiryId} ${action}d successfully`);
      }
      // Handle notifications without data field - try to extract from title/description
      else if (!data || Object.keys(data).length === 0) {
        console.log('Notification has no data field, trying to extract from title/description');
        console.log('Title:', notification.title);
        console.log('Description:', notification.description);
        
        // For now, show error since we can't determine the ID without data
        toast.error('Cannot process notification - missing data field');
        return;
      }
      // Check if notification title contains keywords to determine type
      else if (notification.title?.toLowerCase().includes('listing') && (data?.listingId || data?.id)) {
        const listingId = data.listingId || data.id;
        console.log(`${action}ing listing (by title):`, listingId);
        console.log('Notification data for listing:', data);
        await updateListingStatus(listingId, newStatus);
        successMessage = `Listing ${action}d successfully`;
        console.log(`Listing ${listingId} ${action}d successfully`);
      }
      else if (notification.title?.toLowerCase().includes('inquiry') && (data?.inquiryId || data?.id)) {
        const inquiryId = data.inquiryId || data.id;
        console.log(`${action}ing inquiry (by title):`, inquiryId);
        await updateInquiryStatus(inquiryId, newStatus);
        successMessage = `Inquiry ${action}d successfully`;
        console.log(`Inquiry ${inquiryId} ${action}d successfully`);
      }
      // Check if we can extract ID from notification description or other fields
      else if (data?.id) {
        // Try to determine type from notification content
        if (notification.title?.toLowerCase().includes('listing') || notification.description?.toLowerCase().includes('listing')) {
          console.log(`${action}ing listing (by content):`, data.id);
          await updateListingStatus(data.id, newStatus);
          successMessage = `Listing ${action}d successfully`;
          console.log(`Listing ${data.id} ${action}d successfully`);
        } else if (notification.title?.toLowerCase().includes('inquiry') || notification.description?.toLowerCase().includes('inquiry')) {
          console.log(`${action}ing inquiry (by content):`, data.id);
          await updateInquiryStatus(data.id, newStatus);
          successMessage = `Inquiry ${action}d successfully`;
          console.log(`Inquiry ${data.id} ${action}d successfully`);
        } else {
          console.warn('Cannot determine notification type from content:', data);
          toast.error('Cannot determine request type from notification');
          return;
        }
      } else {
        console.warn('Unknown notification type or missing ID:', data);
        console.warn('Available data keys:', Object.keys(data || {}));
        toast.error('Cannot process this notification type - missing ID');
        return;
      }

      // Send FCM notification to the specific user about the approval/rejection
      try {
        if (data?.type === 'listing' || notification.title?.toLowerCase().includes('listing')) {
          const listingId = data.listingId || data.id;
          const userId = data.ownerId || data.userId;
          
          if (userId) {
            // Send notification to the user who made the listing request (status changes are not stored)
            const notificationResult = await FilteredNotificationService.sendToUser(userId, {
              title: `Listing ${newStatus}`,
              body: `Your listing "${data.propertyTitle || 'Property'}" has been ${newStatus.toLowerCase()}`,
              data: {
                listingId: listingId,
                status: newStatus,
                type: 'listing_status_change'
              }
            });
            
            if (notificationResult?.fallback) {
              console.log('Listing notification stored in database (push notification failed):', userId);
              toast.success('Request processed - notification stored in database');
            } else if (notificationResult?.success) {
              console.log('Listing status notification sent to user:', userId);
            } else {
              console.warn('Listing notification failed:', notificationResult?.error);
              toast.error('Request processed but user notification failed');
            }
          }
        } else if (data?.type === 'inquiry' || notification.title?.toLowerCase().includes('inquiry')) {
          const inquiryId = data.inquiryId || data.id;
          const userId = data.userId || data.inquirerId;
          
          if (userId) {
            // Send notification to the user who made the inquiry (status changes are not stored)
            const notificationResult = await FilteredNotificationService.sendToUser(userId, {
              title: `Inquiry ${newStatus}`,
              body: `Your inquiry has been ${newStatus.toLowerCase()}`,
              data: {
                inquiryId: inquiryId,
                status: newStatus,
                type: 'inquiry_status_change'
              }
            });
            
            if (notificationResult?.fallback) {
              console.log('Inquiry notification stored in database (push notification failed):', userId);
              toast.success('Request processed - notification stored in database');
            } else if (notificationResult?.success) {
              console.log('Inquiry status notification sent to user:', userId);
            } else {
              console.warn('Inquiry notification failed:', notificationResult?.error);
              toast.error('Request processed but user notification failed');
            }
          }
        }
      } catch (notificationError) {
        console.error('Error sending notification to user:', notificationError);
        // Show a warning to admin that notification might not have been sent
        toast.error('Request processed but user notification may not have been sent');
        // Don't fail the main action if notification creation fails
      }

      // Store the action in backend
      try {
        const actionResponse = await fetch('/api/notifications/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationId,
            action,
            adminId: 'admin', // You might want to get this from auth context
            requestType: data?.type || (notification.title?.toLowerCase().includes('listing') ? 'listing' : 'inquiry'),
            requestId: data?.listingId || data?.inquiryId || data?.id,
            details: {
              originalNotificationTitle: notification.title,
              originalNotificationDescription: notification.description,
              status: newStatus,
              timestamp: new Date().toISOString()
            }
          })
        });

        if (!actionResponse.ok) {
          throw new Error('Failed to store notification action');
        }

        console.log('Notification action stored successfully');
      } catch (actionStorageError) {
        console.error('Error storing notification action:', actionStorageError);
        // Don't fail the main action if action storage fails
      }

      // Send notification to admin's mobile app about the action taken
      try {
        if (data?.type === 'listing' || notification.title?.toLowerCase().includes('listing')) {
          const listingId = data.listingId || data.id;
          if (newStatus === 'approved') {
            await clientNotificationService.notifyListingApproved({
              id: listingId,
              title: data.propertyTitle || 'Property',
              location: data.location || 'Unknown',
              price: data.price || 'N/A'
            });
          } else if (newStatus === 'rejected') {
            await clientNotificationService.notifyListingRejected({
              id: listingId,
              title: data.propertyTitle || 'Property',
              location: data.location || 'Unknown',
              price: data.price || 'N/A'
            });
          }
        } else if (data?.type === 'inquiry' || notification.title?.toLowerCase().includes('inquiry')) {
          const inquiryId = data.inquiryId || data.id;
          await clientNotificationService.notifyInquiryAction({
            id: inquiryId,
            listingTitle: data.propertyTitle || 'Property',
            customerName: data.inquirerName || 'Customer'
          }, newStatus);
        }
      } catch (adminNotificationError) {
        console.error('Error creating admin notification:', adminNotificationError);
        // Don't fail the main action if admin notification creation fails
      }

      // Show success message
      toast.success(successMessage);

      // Delete the notification after successful processing
      try {
        await deleteNotification(notificationId);
        console.log('Notification deleted successfully');
      } catch (deleteError) {
        console.error('Error deleting notification:', deleteError);
        // Don't show error to user as the main action was successful
      }

    } catch (error) {
      console.error('Error handling notification action:', error);
      toast.error(`Failed to ${action} request`);
    }
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <header className="flex md:justify-between items-center md:gap-10 px-3 border-b border-black/20">
        <div className="flex justify-end items-center w-full ">
          <div className="flex md:justify-between items-center md:gap-10 px-3 md:px-4 py-3 ml-3 md:ml-0 relative">
            <div className="relative left-2 flex gap-5">
              <button
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full relative"
                aria-label="Notifications"
                onClick={handleNotificationClick}
              >
                <BellIcon size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center border-l border-[#D6D6D666] pl-4">
              <button
                className="flex items-center space-x-3 focus:outline-none"
                aria-label="Profile"
              >
                <Image
                  src={UserAvatar}
                  alt="Profile"
                  width={50}
                  height={50}
                  className="rounded-full h-12 w-12 border"
                />
              </button>
            </div>
          </div>
        </div>
      </header>
      {showModal && (
        <DetailsModal 
          onclose={closeModals}
          notifications={notifications}
          formatTimeAgo={formatTimeAgo}
          onNotificationAction={handleNotificationAction}
        />
      )}
    </>
  );
};

export default Header;
