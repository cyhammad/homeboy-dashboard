import { useState, useEffect } from 'react';
import { listenToCollection } from '@/lib/firebaseUtils';
import { COLLECTIONS } from '@/lib/firebase';

export const useRealtimeData = () => {
  const [data, setData] = useState({
    users: [],
    listings: [],
    inquiries: [],
    notifications: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = [];

    // Listen to all collections in real-time
    const setupListeners = () => {
      // Users listener
      const unsubscribeUsers = listenToCollection(
        COLLECTIONS.USERS,
        (users) => {
          setData(prev => ({ ...prev, users }));
        },
        { limit: 50 }
      );
      unsubscribers.push(unsubscribeUsers);

      // Listings listener
      const unsubscribeListings = listenToCollection(
        COLLECTIONS.LISTINGS,
        (listings) => {
          setData(prev => ({ ...prev, listings }));
        },
        { limit: 100 }
      );
      unsubscribers.push(unsubscribeListings);

      // Inquiries listener
      const unsubscribeInquiries = listenToCollection(
        COLLECTIONS.INQUIRIES,
        (inquiries) => {
          // Map the inquiry data to match expected structure
          const mappedInquiries = inquiries.map(inquiry => ({
            id: inquiry.id,
            inquiryId: inquiry.id,
            listingId: inquiry.property?.id || inquiry.id,
            inquirerName: inquiry.buyerName,
            inquirerEmail: inquiry.buyerEmail,
            inquirerPhone: inquiry.buyerPhone,
            message: inquiry.description,
            inquiryType: 'general',
            priority: 'medium',
            status: inquiry.status?.toLowerCase() || 'pending',
            createdAt: inquiry.requestedAt || inquiry.createdAt,
            updatedAt: inquiry.requestedAt || inquiry.createdAt,
            property: inquiry.property,
            userId: inquiry.userId,
            ...inquiry
          }));
          setData(prev => ({ ...prev, inquiries: mappedInquiries }));
        },
        { limit: 100 }
      );
      unsubscribers.push(unsubscribeInquiries);

      // Notifications listener
      const unsubscribeNotifications = listenToCollection(
        COLLECTIONS.NOTIFICATIONS,
        (notifications) => {
          setData(prev => ({ ...prev, notifications }));
        },
        { limit: 20 }
      );
      unsubscribers.push(unsubscribeNotifications);

      setLoading(false);
    };

    setupListeners();

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  // Calculate real-time stats
  const stats = {
    totalUsers: data.users.length,
    totalListings: data.listings.length,
    totalInquiries: data.inquiries.length,
    totalNotifications: data.notifications.length,
    pendingInquiries: data.inquiries.filter(inquiry => inquiry.status === 'pending').length,
    activeListings: data.listings.filter(listing => listing.status === 'active').length,
    recentUsers: data.users.filter(user => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const createdAt = new Date(user.createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length
  };

  return {
    data,
    stats,
    loading
  };
};
