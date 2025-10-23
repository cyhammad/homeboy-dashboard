"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAllUsers, 
  getListings, 
  getInquiries, 
  getUserNotifications,
  listenToCollection,
  createNotification
} from '@/lib/firebaseUtils';
import { COLLECTIONS } from '@/lib/firebase';
import { useAuth } from './AuthContext';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState({
    users: [],
    listings: [],
    inquiries: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribers = [];
    let isInitialized = false;
    let connectionTimeout;

    const setupRealtimeListeners = () => {
      try {
        // Add throttling and debouncing to prevent excessive requests
        const throttledUpdate = (callback) => {
          let timeoutId;
          let lastUpdate = 0;
          const throttleDelay = 500; // 500ms throttle
          
          return (data) => {
            const now = Date.now();
            if (now - lastUpdate < throttleDelay) {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                callback(data);
                lastUpdate = Date.now();
              }, throttleDelay - (now - lastUpdate));
            } else {
              callback(data);
              lastUpdate = now;
            }
          };
        };

        // Users listener with throttling
        const unsubscribeUsers = listenToCollection(
          COLLECTIONS.USERS,
          throttledUpdate((users) => {
            setData(prev => ({ ...prev, users }));
          }),
          { limit: 50 }
        );
        unsubscribers.push(unsubscribeUsers);

        // Listings listener with throttling
        const unsubscribeListings = listenToCollection(
          COLLECTIONS.LISTINGS,
          throttledUpdate((listings) => {
            // Check for new listings and create notifications
            setData(prev => {
              const previousListings = prev.listings || [];
              
              // Simple detection: check by ID only
              const newListings = listings.filter(newListing => {
                const isNewById = !previousListings.some(prevListing => prevListing.id === newListing.id);
                return isNewById;
              });
              
              // Only skip if this is truly the first load (no previous state at all)
              if (prev.listings === undefined && listings.length > 0) {
                return { ...prev, listings };
              }
              
              // Notifications are now handled by the mobile app directly
              // No need to create notifications in the realtime listener
              
              return { ...prev, listings };
            });
          }),
          { limit: 100 }
        );
        unsubscribers.push(unsubscribeListings);

        // Inquiries listener with throttling
        const unsubscribeInquiries = listenToCollection(
          COLLECTIONS.INQUIRIES,
          throttledUpdate((inquiries) => {
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
            
            // Check for new inquiries and create notifications
            setData(prev => {
              const previousInquiries = prev.inquiries || [];
              const newInquiries = mappedInquiries.filter(newInquiry => 
                !previousInquiries.some(prevInquiry => prevInquiry.id === newInquiry.id)
              );
              
              
              // Notifications are now handled by the mobile app directly
              // No need to create notifications in the realtime listener
              
              return { ...prev, inquiries: mappedInquiries };
            });
          }),
          { limit: 100 }
        );
        unsubscribers.push(unsubscribeInquiries);

        // Notifications listener with throttling
        const unsubscribeNotifications = listenToCollection(
          COLLECTIONS.NOTIFICATIONS,
          throttledUpdate((notifications) => {
            setData(prev => ({ ...prev, notifications }));
          }),
          { limit: 100 }
        );
        unsubscribers.push(unsubscribeNotifications);

        setLoading(false);
        setError(null);
        isInitialized = true;
      } catch (err) {
        console.error('Error setting up Firebase listeners:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Add a small delay to prevent rapid reconnections
    connectionTimeout = setTimeout(() => {
    setupRealtimeListeners();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(connectionTimeout);
      unsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [user]);

  // Calculate real-time stats with proper month-over-month growth
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Helper function to get date from Firestore timestamp or string
  const getDate = (dateField) => {
    if (!dateField) return null;
    if (dateField.toDate) {
      return dateField.toDate();
    }
    return new Date(dateField);
  };

  // Current month data
  const currentMonthUsers = data.users.filter(user => {
    const userDate = getDate(user.createdAt);
    if (!userDate) return false;
    return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
  }).length;

  const currentMonthListings = data.listings.filter(listing => {
    const listingDate = getDate(listing.createdAt);
    if (!listingDate) return false;
    return listingDate.getMonth() === currentMonth && listingDate.getFullYear() === currentYear;
  }).length;

  const currentMonthInquiries = data.inquiries.filter(inquiry => {
    const inquiryDate = getDate(inquiry.createdAt);
    if (!inquiryDate) return false;
    return inquiryDate.getMonth() === currentMonth && inquiryDate.getFullYear() === currentYear;
  }).length;

  // Calculate previous month data
  const previousMonthUsers = data.users.filter(user => {
    const userDate = getDate(user.createdAt);
    if (!userDate) return false;
    return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastMonthYear;
  }).length;

  const previousMonthListings = data.listings.filter(listing => {
    const listingDate = getDate(listing.createdAt);
    if (!listingDate) return false;
    return listingDate.getMonth() === lastMonth && listingDate.getFullYear() === lastMonthYear;
  }).length;

  const previousMonthInquiries = data.inquiries.filter(inquiry => {
    const inquiryDate = getDate(inquiry.createdAt);
    if (!inquiryDate) return false;
    return inquiryDate.getMonth() === lastMonth && inquiryDate.getFullYear() === lastMonthYear;
  }).length;

  // Calculate actual month-over-month growth
  const calculateGrowth = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0; // 100% if going from 0 to any number
    }
    return Math.round(((current - previous) / previous) * 100);
  };

  const usersGrowth = calculateGrowth(currentMonthUsers, previousMonthUsers);
  const listingsGrowth = calculateGrowth(currentMonthListings, previousMonthListings);
  const inquiriesGrowth = calculateGrowth(currentMonthInquiries, previousMonthInquiries);

  const stats = {
    totalUsers: data.users.length,
    totalListings: data.listings.length,
    totalInquiries: data.inquiries.length,
    totalNotifications: data.notifications.length,
    pendingInquiries: data.inquiries.filter(inquiry => inquiry.status === 'pending').length,
    activeListings: data.listings.filter(listing => listing.status === 'approved').length,
    // Growth percentages with actual month-over-month comparison
    usersGrowth: usersGrowth,
    listingsGrowth: listingsGrowth,
    inquiriesGrowth: inquiriesGrowth,
    // Debug info (you can remove this later)
    debug: {
      currentMonthUsers,
      previousMonthUsers,
      currentMonthListings,
      previousMonthListings,
      currentMonthInquiries,
      previousMonthInquiries
    }
  };

  const value = {
    data,
    stats,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      // Re-trigger useEffect
      window.location.reload();
    }
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
