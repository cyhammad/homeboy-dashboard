"use client";
import Image from "next/image";
import UserAvatar from "./useravatar.png";
import DetailsModal from "./DetailsModal";
import BellIcon from "@/assets/icons/Bell";

import { useState } from "react";
import { useModal } from "@/context/ModalContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useListingRequests } from "@/hooks/useListingRequests";
import { useInquiryRequests } from "@/hooks/useInquiryRequests";
import { deleteNotification } from "@/lib/firebaseUtils";
import toast, { Toaster } from "react-hot-toast";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { openModal, closeModal } = useModal();
  const { notifications, unreadCount, markAsRead, formatTimeAgo } = useNotifications();
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
      // Check if notification title contains keywords to determine type
      else if (notification.title?.toLowerCase().includes('listing') && (data?.listingId || data?.id)) {
        const listingId = data.listingId || data.id;
        console.log(`${action}ing listing (by title):`, listingId);
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
