import { useState, useEffect } from 'react';
import { useFirebase } from '@/context/FirebaseContext';
import { 
  createNotification, 
  markNotificationAsRead
} from '@/lib/firebaseUtils';

export const useNotifications = () => {
  const { data } = useFirebase();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use notifications from Firebase context
        const notificationsData = data.notifications || [];
        
        console.log('Raw notifications data:', notificationsData);
        
        // Sort by createdAt (newest first) and handle different date formats
        const sortedNotifications = notificationsData.sort((a, b) => {
          let dateA, dateB;
          
          // Handle Firestore timestamp or string date for dateA
          if (a.createdAt?.toDate) {
            dateA = a.createdAt.toDate();
          } else if (a.createdAt) {
            dateA = new Date(a.createdAt);
          } else {
            dateA = new Date(0); // fallback to epoch
          }
          
          // Handle Firestore timestamp or string date for dateB
          if (b.createdAt?.toDate) {
            dateB = b.createdAt.toDate();
          } else if (b.createdAt) {
            dateB = new Date(b.createdAt);
          } else {
            dateB = new Date(0); // fallback to epoch
          }
          
          // Sort by date descending (newest first)
          return dateB - dateA;
        });
        
        console.log('Sorted notifications:', sortedNotifications);
        
        // Map notification fields to match expected structure
        const mappedNotifications = sortedNotifications.map(notification => ({
          ...notification,
          isSeen: notification.isSeen || false,
          read: notification.read || false,
          // Ensure we have proper date handling
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt,
          readAt: notification.readAt
        }));
        
        console.log('Mapped notifications:', mappedNotifications);
        
        // Filter to only show pending request notifications
        const pendingRequestNotifications = mappedNotifications.filter(notification => {
          const title = notification.title?.toLowerCase() || '';
          const dataType = notification.data?.type || '';
          
          // Check if it's a pending listing request notification
          const isPendingListing = 
            (dataType === 'listing' || title.includes('listing')) &&
            (title.includes('new listing request') || 
             title.includes('listing request') ||
             title.includes('new listing'));
          
          // Check if it's a pending inquiry request notification
          const isPendingInquiry = 
            (dataType === 'inquiry' || title.includes('inquiry')) &&
            (title.includes('new inquiry') || 
             title.includes('inquiry request') ||
             title.includes('new inquiry request'));
          
          return isPendingListing || isPendingInquiry;
        });
        
        console.log('Filtered pending request notifications:', pendingRequestNotifications);
        setNotifications(pendingRequestNotifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [data.notifications]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { 
                ...notification, 
                isSeen: true, 
                read: true,
                readAt: new Date().toISOString()
              }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };


  // Create new notification
  const sendNotification = async (notificationData) => {
    try {
      const newNotification = await createNotification({
        title: notificationData.title,
        description: notificationData.description,
        userId: notificationData.userId,
        type: notificationData.type || 'general',
        data: notificationData.data || {},
        ...notificationData
      });
      
      // Add to local state
      setNotifications(prev => [newNotification, ...prev]);
      
      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Format date for display
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    let date;
    if (dateString.toDate) {
      date = dateString.toDate();
    } else {
      date = new Date(dateString);
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get unread count - notification is unread if both isSeen is false AND read is false
  const unreadCount = notifications.filter(notification => 
    notification.isSeen === false && notification.read === false
  ).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    sendNotification,
    formatTimeAgo,
    refresh: () => {
      setLoading(true);
      // Re-trigger useEffect
      window.location.reload();
    }
  };
};
