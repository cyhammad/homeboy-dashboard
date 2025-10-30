"use client";
import Image from "next/image";
import UserAvatar from "./useravatar.png";
import BellIcon from "@/assets/icons/Bell";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUserData, getUserInitials } from "@/hooks/useUserData";
import { useListing } from "@/hooks/useListings";
import { onForegroundMessage, showNotification } from "@/lib/fcm-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationItem = ({ 
  notification, 
  onNotificationClick, 
  onNotificationAction,
  formatDate,
  loadingNotifications = {}
}) => {
  // Use senderId for user data, fallback to userId
  const userIdToFetch = notification.senderId || notification.userId;
  const { userData, loading: userLoading } = useUserData(userIdToFetch);
  
  // Fetch listing data if listingId exists
  const { listing, loading: listingLoading } = useListing(notification.listingId);
  
  const userImage = userData?.imageUrl;
  const userName = userData?.name || notification.data?.ownerName || "User";
  const initials = getUserInitials(userName);
  
  const isActionLoading = loadingNotifications[notification.id] || false;
  const listingStatus = listing?.status;

  return (
    <div
      className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex-shrink-0 mr-4">
        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-semibold text-sm">
              {initials}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium leading-5">
          {notification.title || "New Notification"}
        </p>
        {(notification.description ||
          notification.body ||
          notification.message) && (
          <p className="text-xs text-gray-600 mt-1 leading-4">
            {notification.description ||
              notification.body ||
              notification.message}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(notification.createdAt)}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {listing && listingStatus === "pending" && !isActionLoading && notification.title !== "New Property Inquiry Request" && (
          <div className="flex gap-1">
            <button
              onClick={() =>
                onNotificationAction(notification.id, "reject")
              }
              className="px-4 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80 whitespace-nowrap text-xs"
            >
              Reject
            </button>
            <button
              onClick={() =>
                onNotificationAction(notification.id, "approve")
              }
              className="px-4 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80 whitespace-nowrap text-xs"
            >
              Accept
            </button>
          </div>
        )}
        {listing && listingStatus === "pending" && isActionLoading && notification.title !== "New Property Inquiry Request" && (
          <div className="flex items-center gap-2 px-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            <span className="text-xs text-gray-600">Processing...</span>
          </div>
        )}
        {listingStatus === "approved" && notification.title !== "New Property Inquiry Request" && (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-medium">Accepted</span>
          </div>
        )}
        {listingStatus === "rejected" && notification.title !== "New Property Inquiry Request" && (
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs font-medium">Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const { notifications, loading, error } = useNotifications();
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasNewPush, setHasNewPush] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState({});

  // Show a dot if there are unseen notifications or we just received a push
  const adminNotifications = useMemo(() => {
    // Filter by recieverId for admin notifications, fallback to userId
    return (notifications || []).filter((n) => n.senderId !== 'FsdBt8wB7Edku66IZaa0k5tqUsH3' || n.receiverId === 'FsdBt8wB7Edku66IZaa0k5tqUsH3' || n.userId === 'admin');
  }, [notifications]);

  const hasUnseen = useMemo(() => {
    if (!adminNotifications || adminNotifications.length === 0) return false;
    return adminNotifications.some((n) => n.isSeen === false);
  }, [adminNotifications]);

  const showDot = hasNewPush || hasUnseen;

  // Foreground push listener so the dot appears instantly without refresh
  useEffect(() => {
    onForegroundMessage((payload) => {
      try {
        // Show native notification too
        if (payload?.notification) {
          showNotification(payload);
        }
      } catch {}
      // Flag that a new push arrived so we render the dot immediately
      setHasNewPush(true);
    });
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };


  const handleNotificationAction = async (notificationId, action) => {
    // Set loading state
    setLoadingNotifications(prev => ({ ...prev, [notificationId]: true }));
    
    try {
      // Get the notification to find listingId
      const notification = adminNotifications.find(n => n.id === notificationId);
      const listingId = notification?.listingId;

      if (!listingId) {
        console.error("No listingId found in notification");
        setLoadingNotifications(prev => ({ ...prev, [notificationId]: false }));
        return;
      }

      // Update listing status first
      const listingResponse = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
        }),
      });

      if (!listingResponse.ok) {
        throw new Error("Failed to update listing status");
      }

      // Then update notification action
      const response = await fetch("/api/notifications/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          action,
          adminId: "admin",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform notification action");
      }

      console.log(`Listing ${action}d successfully`);
    } catch (error) {
      console.error("Error performing notification action:", error);
    } finally {
      // Clear loading state
      setLoadingNotifications(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleNotificationClick = (notification) => {
    // Close the notification modal
    setIsNotificationOpen(false);
    
    // Navigate based on notification title
    if (notification.title === "New Property Inquiry Request") {
      router.push("/inquiry-requests");
    } else {
      // Default to listing requests
      router.push("/listing-requests");
    }
  };

  return (
    <>
      <header className="flex md:justify-between items-center md:gap-10 px-3 border-b border-black/20">
        <div className="flex justify-end items-center w-full ">
          <div className="flex md:justify-between items-center md:gap-10 px-3 md:px-4 py-3 ml-3 md:ml-0 relative">
            <div className="relative left-2 flex gap-5">
              <DropdownMenu
                open={isNotificationOpen}
                onOpenChange={(open) => {
                  setIsNotificationOpen(open);
                  if (open) setHasNewPush(false);
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative flex items-center cursor-pointer justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <BellIcon size={24} />
                    {showDot && (
                      <span className="absolute top-2.5 right-2.5 inline-block w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[586px] max-w-[90vw] p-0 rounded-xl"
                  sideOffset={8}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Notifications
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setIsNotificationOpen(false)}
                      aria-label="Close"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-gray-500">
                          Loading notifications...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center p-8">
                        <span className="text-sm text-red-500">
                          Error loading notifications
                        </span>
                      </div>
                    ) : adminNotifications.length === 0 ? (
                      <div className="flex items-center justify-center p-8">
                        <span className="text-sm text-gray-500">
                          No notifications
                        </span>
                      </div>
                    ) : (
                      adminNotifications.slice(0, 10).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onNotificationClick={handleNotificationClick}
                          onNotificationAction={handleNotificationAction}
                          formatDate={formatDate}
                          loadingNotifications={loadingNotifications}
                        />
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center border-l border-[#D6D6D666]">
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
    </>
  );
};

export default Header;
