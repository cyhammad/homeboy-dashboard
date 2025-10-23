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

    const setupRealtimeListeners = () => {
      try {
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
            console.log('📋 Listings listener triggered with', listings.length, 'listings');
            console.log('📋 All listings IDs:', listings.map(l => l.id));
            
            // Check for new listings and create notifications
            setData(prev => {
              const previousListings = prev.listings || [];
              console.log('📊 Previous listings count:', previousListings.length);
              console.log('📊 Current listings count:', listings.length);
              
              // Simple detection: check by ID only
              const newListings = listings.filter(newListing => {
                const isNewById = !previousListings.some(prevListing => prevListing.id === newListing.id);
                console.log(`🔍 Checking listing ${newListing.id}: isNew = ${isNewById}`);
                return isNewById;
              });
              
              console.log('🆕 New listings detected:', newListings.length);
              console.log('New listings data:', newListings);
              
              // Only skip if this is truly the first load (no previous state at all)
              if (prev.listings === undefined && listings.length > 0) {
                console.log('🚫 First load detected - skipping notification creation');
                return { ...prev, listings };
              }
              
              // Create notifications for new listings
              if (newListings.length > 0) {
                newListings.forEach(listing => {
                  // Skip if listing doesn't have required fields
                  if (!listing.id) {
                    console.warn('⚠️ Skipping listing notification - missing ID:', listing);
                    return;
                  }
                  
                  const ownerName = listing.ownerName || listing.owner || 'Property Owner';
                  const propertyTitle = listing.title || 'Property';
                  const listingStatus = listing.status || 'pending';
                  
                  console.log('🔔 Creating notification for listing:', {
                    id: listing.id,
                    title: propertyTitle,
                    owner: ownerName,
                    status: listingStatus
                  });
                  
                  createNotification({
                    title: "New Listing Request",
                    description: `${ownerName} submitted a new property listing`,
                    userId: 'admin',
                    type: 'listing',
                    data: {
                      type: 'listing',
                      listingId: listing.id,
                      ownerName: ownerName,
                      propertyTitle: propertyTitle,
                      status: listingStatus,
                      source: 'realtime-listener'
                    },
                    isSeen: false
                  }).then(notification => {
                    console.log('✅ Notification created successfully:', notification.id);
                  }).catch(error => {
                    console.error('❌ Error creating listing notification:', error);
                  });
                });
              }
              
              return { ...prev, listings };
            });
          },
          { limit: 100 }
        );
        unsubscribers.push(unsubscribeListings);

        // Inquiries listener - use basic query without ordering to avoid field issues
        const unsubscribeInquiries = listenToCollection(
          COLLECTIONS.INQUIRIES,
          (inquiries) => {
            console.log('Raw inquiries from listener:', inquiries);
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
            console.log('Mapped inquiries from listener:', mappedInquiries);
            
            // Check for new inquiries and create notifications
            setData(prev => {
              const previousInquiries = prev.inquiries || [];
              const newInquiries = mappedInquiries.filter(newInquiry => 
                !previousInquiries.some(prevInquiry => prevInquiry.id === newInquiry.id)
              );
              
              // Create notifications for new inquiries
              if (newInquiries.length > 0) {
                newInquiries.forEach(inquiry => {
                  // Skip if inquiry doesn't have required fields
                  if (!inquiry.id) {
                    console.warn('Skipping inquiry notification - missing ID:', inquiry);
                    return;
                  }
                  
                  const inquirerName = inquiry.inquirerName || inquiry.buyerName || 'Someone';
                  const propertyId = inquiry.listingId || inquiry.propertyId || inquiry.id;
                  
                  createNotification({
                    title: "New Inquiry",
                    description: `${inquirerName} is interested in a property`,
                    userId: 'admin',
                    type: 'inquiry',
                    data: {
                      type: 'inquiry',
                      inquiryId: inquiry.id,
                      inquirerName: inquirerName,
                      propertyId: propertyId,
                      source: 'realtime-listener'
                    },
                    isSeen: false
                  }).catch(error => {
                    console.error('Error creating inquiry notification:', error);
                  });
                });
              }
              
              return { ...prev, inquiries: mappedInquiries };
            });
          },
          { limit: 100 }
        );
        unsubscribers.push(unsubscribeInquiries);

        // Notifications listener - show all notifications
        const unsubscribeNotifications = listenToCollection(
          COLLECTIONS.NOTIFICATIONS,
          (notifications) => {
            setData(prev => ({ ...prev, notifications }));
          },
          { limit: 100 }
        );
        unsubscribers.push(unsubscribeNotifications);

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error setting up Firebase listeners:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    setupRealtimeListeners();

    // Cleanup function
    return () => {
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
