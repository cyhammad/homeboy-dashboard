import { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  getListings, 
  getInquiries, 
  getUserNotifications,
  recordAnalytics 
} from '@/lib/firebaseUtils';

export const useDashboardData = () => {
  const [data, setData] = useState({
    users: [],
    listings: [],
    inquiries: [],
    notifications: [],
    loading: true,
    error: null
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalInquiries: 0,
    totalNotifications: 0,
    pendingInquiries: 0,
    activeListings: 0,
    recentUsers: 0
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch all data in parallel
        const [users, listings, inquiries, notifications] = await Promise.all([
          getAllUsers(50),
          getListings({ limit: 100 }),
          getInquiries({ limit: 100 }),
          getUserNotifications('admin', 20) // Replace 'admin' with actual user ID
        ]);

        // Calculate stats
        const totalUsers = users.length;
        const totalListings = listings.length;
        const totalInquiries = inquiries.length;
        const totalNotifications = notifications.length;
        const pendingInquiries = inquiries.filter(inquiry => inquiry.status === 'pending').length;
        const activeListings = listings.filter(listing => listing.status === 'active').length;
        
        // Calculate recent users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= thirtyDaysAgo;
        }).length;

        // Generate chart data for the last 12 months
        const chartData = generateChartData(users, inquiries);

        setData({
          users,
          listings,
          inquiries,
          notifications,
          loading: false,
          error: null
        });

        setStats({
          totalUsers,
          totalListings,
          totalInquiries,
          totalNotifications,
          pendingInquiries,
          activeListings,
          recentUsers
        });

        setChartData(chartData);

        // Record analytics
        await recordAnalytics('dashboard_view', 1, {
          page: '/dashboard',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    };

    fetchDashboardData();
  }, []);

  return {
    data,
    stats,
    chartData,
    loading: data.loading,
    error: data.error,
    refetch: () => {
      setData(prev => ({ ...prev, loading: true }));
      // Re-trigger useEffect
      window.location.reload();
    }
  };
};

// Generate chart data for the last 12 months
const generateChartData = (users, inquiries) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const currentDate = new Date();
  const chartData = [];

  console.log('Generating chart data with users:', users?.length, 'inquiries:', inquiries?.length);

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = months[date.getMonth()];
    
    // Count users created in this month
    const monthUsers = users?.filter(user => {
      if (!user.createdAt) return false;
      let userDate;
      
      // Handle different date formats
      if (user.createdAt.toDate) {
        // Firestore timestamp
        userDate = user.createdAt.toDate();
      } else {
        // String date
        userDate = new Date(user.createdAt);
      }
      
      return userDate.getMonth() === date.getMonth() && 
             userDate.getFullYear() === date.getFullYear();
    }).length || 0;

    // Count inquiries created in this month
    const monthInquiries = inquiries?.filter(inquiry => {
      const dateField = inquiry.requestedAt || inquiry.createdAt;
      if (!dateField) return false;
      
      let inquiryDate;
      
      // Handle different date formats
      if (dateField.toDate) {
        // Firestore timestamp
        inquiryDate = dateField.toDate();
      } else {
        // String date
        inquiryDate = new Date(dateField);
      }
      
      return inquiryDate.getMonth() === date.getMonth() && 
             inquiryDate.getFullYear() === date.getFullYear();
    }).length || 0;

    chartData.push({
      name: monthName,
      users: monthUsers,
      inquiries: monthInquiries
    });
  }

  console.log('Generated chart data:', chartData);
  return chartData;
};
