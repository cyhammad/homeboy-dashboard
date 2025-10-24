"use client";
import Image from "next/image";
import UserAvatar from "./useravatar.png";
import BellIcon from "@/assets/icons/Bell";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { notifications, loading, error } = useNotifications();
  const router = useRouter();

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getInitials = (name) => {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNotificationAction = async (notificationId, action) => {
    try {
      const response = await fetch('/api/notifications/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action,
          adminId: 'admin'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      console.log(`Notification ${action}ed successfully`);
    } catch (error) {
      console.error('Error performing notification action:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    if (notification.type === 'listing') {
      router.push('/listing-requests');
    } else if (notification.type === 'inquiry') {
      router.push('/inquiry-requests');
    } else {
      // Default to dashboard
      router.push('/');
    }
  };

  return (
    <>
      <header className="flex md:justify-between items-center md:gap-10 px-3 border-b border-black/20">
        <div className="flex justify-end items-center w-full ">
          <div className="flex md:justify-between items-center md:gap-10 px-3 md:px-4 py-3 ml-3 md:ml-0 relative">
            <div className="relative left-2 flex gap-5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <BellIcon size={24} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-96 p-0"
                  sideOffset={8}
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading notifications...</span>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center p-8">
                        <span className="text-sm text-red-500">Error loading notifications</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex items-center justify-center p-8">
                        <span className="text-sm text-gray-500">No notifications</span>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div 
                          key={notification.id} 
                          className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mr-4">
                            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-semibold text-sm">
                              {getInitials(notification.data?.ownerName || 'User')}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium">
                              {notification.title || 'New Notification'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          {notification.data?.status === 'pending' && (
                            <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleNotificationAction(notification.id, 'reject')}
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => handleNotificationAction(notification.id, 'approve')}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          )}
                        </div>
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
