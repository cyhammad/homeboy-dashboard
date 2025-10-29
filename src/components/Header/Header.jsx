"use client";
import Image from "next/image";
import UserAvatar from "./useravatar.png";
import BellIcon from "@/assets/icons/Bell";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUserData, getUserInitials } from "@/hooks/useUserData";
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
  formatDate 
}) => {
  const { userData, loading: userLoading } = useUserData(notification.userId);
  
  const userImage = userData?.imageUrl;
  const userName = userData?.name || notification.data?.ownerName || "User";
  const initials = getUserInitials(userName);

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
      {(!notification.data?.status || notification.data?.status === "pending") && (
        <div
          className="flex gap-1 ml-4 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
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
    </div>
  );
};

const Header = () => {
  const { notifications, loading, error } = useNotifications();
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasNewPush, setHasNewPush] = useState(false);

  // Show a dot if there are unseen notifications or we just received a push
  const hasUnseen = useMemo(() => {
    if (!notifications || notifications.length === 0) return false;
    return notifications.some((n) => n.isSeen === false);
  }, [notifications]);

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
    try {
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
        throw new Error("Failed to perform action");
      }

      console.log(`Notification ${action}ed successfully`);
    } catch (error) {
      console.error("Error performing notification action:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    if (notification.type === "listing") {
      router.push("/listing-requests");
    } else if (notification.type === "inquiry") {
      router.push("/inquiry-requests");
    } else {
      // Default to dashboard
      router.push("/");
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
                    ) : notifications.length === 0 ? (
                      <div className="flex items-center justify-center p-8">
                        <span className="text-sm text-gray-500">
                          No notifications
                        </span>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onNotificationClick={handleNotificationClick}
                          onNotificationAction={handleNotificationAction}
                          formatDate={formatDate}
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
