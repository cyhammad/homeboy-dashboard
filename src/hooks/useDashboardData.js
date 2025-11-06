import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export const useDashboardData = () => {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let usersLoaded = false;
    let listingsLoaded = false;
    let inquiriesLoaded = false;

    const checkAllLoaded = () => {
      if (usersLoaded && listingsLoaded && inquiriesLoaded) {
        setLoading(false);
      }
    };

    // Fetch users - use simple collection query (orderBy may not be available)
    const usersQuery = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Try to get createdAt from various possible fields
          let createdAt = data.createdAt?.toDate?.() || 
                         data.createdAt || 
                         (data.metadata?.creationTime ? new Date(data.metadata.creationTime) : null) ||
                         new Date(); // Fallback to current date if none found
          
          if (createdAt && !(createdAt instanceof Date)) {
            createdAt = new Date(createdAt);
          }
          
          return {
            id: doc.id,
            ...data,
            createdAt: createdAt,
          };
        });
        setUsers(usersData);
        usersLoaded = true;
        checkAllLoaded();
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError(err.message);
        usersLoaded = true;
        checkAllLoaded();
      }
    );

    // Fetch listings
    const listingsQuery = query(
      collection(db, 'listings'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeListings = onSnapshot(
      listingsQuery,
      (snapshot) => {
        const listingsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || (data.createdAt instanceof Date ? data.createdAt : new Date()),
          };
        });
        setListings(listingsData);
        listingsLoaded = true;
        checkAllLoaded();
      },
      (err) => {
        console.error('Error fetching listings:', err);
        setError(err.message);
        listingsLoaded = true;
        checkAllLoaded();
      }
    );

    // Fetch inquiries
    const inquiriesQuery = query(
      collection(db, 'inquiries'),
      orderBy('requestedAt', 'desc')
    );
    const unsubscribeInquiries = onSnapshot(
      inquiriesQuery,
      (snapshot) => {
        const inquiriesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            requestedAt: data.requestedAt?.toDate?.() || (data.requestedAt instanceof Date ? data.requestedAt : new Date()),
          };
        });
        setInquiries(inquiriesData);
        inquiriesLoaded = true;
        checkAllLoaded();
      },
      (err) => {
        console.error('Error fetching inquiries:', err);
        setError(err.message);
        inquiriesLoaded = true;
        checkAllLoaded();
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeListings();
      unsubscribeInquiries();
    };
  }, []);

  // Calculate growth percentages (month-over-month)
  const calculateGrowth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Current month start and end
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
    // Previous month start and end
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Helper function to check if date is in range
    const isInRange = (date, start, end) => {
      if (!date) return false;
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj >= start && dateObj <= end;
    };

    // Calculate current month counts
    const currentMonthUsers = users.filter(user => 
      isInRange(user.createdAt, currentMonthStart, currentMonthEnd)
    ).length;

    const currentMonthListings = listings.filter(listing => 
      isInRange(listing.createdAt, currentMonthStart, currentMonthEnd)
    ).length;

    const currentMonthInquiries = inquiries.filter(inquiry => 
      isInRange(inquiry.requestedAt, currentMonthStart, currentMonthEnd)
    ).length;

    // Calculate previous month counts
    const previousMonthUsers = users.filter(user => 
      isInRange(user.createdAt, previousMonthStart, previousMonthEnd)
    ).length;

    const previousMonthListings = listings.filter(listing => 
      isInRange(listing.createdAt, previousMonthStart, previousMonthEnd)
    ).length;

    const previousMonthInquiries = inquiries.filter(inquiry => 
      isInRange(inquiry.requestedAt, previousMonthStart, previousMonthEnd)
    ).length;

    // Calculate growth percentages
    const calculatePercent = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      const percent = Math.round(((current - previous) / previous) * 100);
      return percent; // Allow negative growth to show decreases
    };

    const userGrowth = calculatePercent(currentMonthUsers, previousMonthUsers);
    const listingGrowth = calculatePercent(currentMonthListings, previousMonthListings);
    const inquiryGrowth = calculatePercent(currentMonthInquiries, previousMonthInquiries);

    return {
      userGrowth,
      listingGrowth,
      inquiryGrowth,
    };
  }, [users, listings, inquiries]);

  // Dashboard data
  const dashboardData = useMemo(() => {
    if (loading) {
      return [
        {
          name: "Total Users",
          amount: "Loading...",
          percent: 0,
          status: "up",
        },
        {
          name: "Total Listings",
          amount: "Loading...",
          percent: 0,
          status: "up",
        },
        {
          name: "Inquiry Requests",
          amount: "Loading...",
          percent: 0,
          status: "up",
        }
      ];
    }

    const totalUsers = users.length;
    const totalListings = listings.length;
    const totalInquiries = inquiries.length;

    return [
      {
        name: "Total Users",
        amount: totalUsers.toString(),
        percent: calculateGrowth.userGrowth,
        status: calculateGrowth.userGrowth >= 0 ? "up" : "down",
      },
      {
        name: "Total Listings",
        amount: totalListings.toString(),
        percent: calculateGrowth.listingGrowth,
        status: calculateGrowth.listingGrowth >= 0 ? "up" : "down",
      },
      {
        name: "Inquiry Requests",
        amount: totalInquiries.toString(),
        percent: calculateGrowth.inquiryGrowth,
        status: calculateGrowth.inquiryGrowth >= 0 ? "up" : "down",
      }
    ];
  }, [users, listings, inquiries, loading, calculateGrowth]);

  return {
    dashboardData,
    listings,
    inquiries,
    users,
    loading,
    error,
  };
};

