import { IMAGES } from "@/assets";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

const NotificationRow = ({ notification, formatTimeAgo, onNotificationAction }) => {
  const router = useRouter();

  const handleNotificationClick = () => {
    // Navigate based on notification type and data
    if (notification.data?.type === 'listing' || notification.title?.toLowerCase().includes('listing')) {
      router.push('/listing-requests');
    } else if (notification.data?.type === 'inquiry' || notification.title?.toLowerCase().includes('inquiry')) {
      router.push('/inquiry-requests');
    } else if (notification.data?.type === 'user' || notification.title?.toLowerCase().includes('user')) {
      router.push('/dashboard');
    } else {
      // Default to dashboard for other notifications
      router.push('/dashboard');
    }
  };

  const handleAction = (action) => {
    if (action === 'approve') {
      onNotificationAction(notification.id, 'approve');
    } else if (action === 'reject') {
      onNotificationAction(notification.id, 'reject');
    }
  };

  return (
    <div className="bg-white">
      <div className="flex gap-2 mx-6 text-sm border-b border-b-black/10">
        <div className="flex-1">
          <div 
            className="flex items-start gap-4 py-2 cursor-pointer hover:bg-gray-50"
            onClick={handleNotificationClick}
          >
            <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-semibold">
              {notification.title?.charAt(0) || 'N'}
            </div>
            <div className="flex flex-col text-xs flex-1">
              <p className="font-semibold text-black">{notification.title}</p>
              <p className="text-gray-600">{notification.description}</p>
              <p className="font-semibold text-new-black">{formatTimeAgo(notification.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="items-center flex text-xs">
          <div className="flex gap-1">
            <button
              onClick={() => handleAction('reject')}
              className="px-4 py-2 rounded-sm text-white bg-red-500 cursor-pointer hover:bg-red-500/80"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction('approve')}
              className="px-4 py-2 rounded-sm text-white bg-primary cursor-pointer hover:bg-primary/80"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsModal = ({ onclose, notifications = [], formatTimeAgo, onNotificationAction }) => {
  return (
    <>
      <div className=" z-20 absolute justify-end flex top-16 right-24 rounded-3xl border border-black/10 bg-white">
        <div className="rounded-2xl top-0 right-0">
          <div className="flex flex-col gap-4 w-[34rem] max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center py-3 px-6 border-b border-b-black/10">
              <p className="font-semibold">Notifications ({notifications.length})</p>
              <p className="cursor-pointer text-2xl" onClick={onclose}>
                ×
              </p>
            </div>
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  formatTimeAgo={formatTimeAgo}
                  onNotificationAction={onNotificationAction}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsModal;
