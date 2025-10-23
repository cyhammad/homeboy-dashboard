import { useState, useEffect, useMemo } from 'react';
import { updateInquiryStatus } from '@/lib/firebaseUtils';
import { useFirebase } from '@/context/FirebaseContext';
import FilteredNotificationService from '@/lib/filteredNotificationService';

export const useInquiryRequests = () => {
  const { data } = useFirebase();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use inquiries directly from Firebase context without re-processing
    const inquiriesData = data.inquiries || [];
    
    // Map the data to match the expected structure (only if data changed)
    const mappedInquiries = inquiriesData.map(inquiry => ({
      id: inquiry.id,
      inquiryId: inquiry.id,
      inquirerName: inquiry.inquirerName || inquiry.buyerName,
      inquirerEmail: inquiry.inquirerEmail || inquiry.buyerEmail,
      inquirerPhone: inquiry.inquirerPhone || inquiry.buyerPhone,
      message: inquiry.message || inquiry.description,
      status: inquiry.status?.toLowerCase() || 'pending',
      createdAt: inquiry.createdAt || inquiry.requestedAt,
      updatedAt: inquiry.updatedAt || inquiry.requestedAt,
      property: inquiry.property,
      userId: inquiry.userId,
      ...inquiry
    }));
    
    setInquiries(mappedInquiries);
    setLoading(false);
  }, [data.inquiries]);

  // Filter inquiries by status (memoized to prevent unnecessary re-renders)
  const getInquiriesByStatus = useMemo(() => {
    return (status) => {
      return inquiries.filter(inquiry => 
        inquiry.status?.toLowerCase() === status.toLowerCase()
      );
    };
  }, [inquiries]);

  // Update inquiry status
  const updateStatus = async (inquiryId, newStatus) => {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      
      // Send notification to user about status change
      const inquiry = inquiries.find(i => i.id === inquiryId);
      if (inquiry) {
        await FilteredNotificationService.notifyInquiryStatusChange(inquiry, newStatus);
      }
      
      // Update local state
      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, status: newStatus, updatedAt: new Date().toISOString() }
            : inquiry
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    let date;
    if (dateString.toDate) {
      // Firestore timestamp
      date = dateString.toDate();
    } else {
      // String date
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return 'IN';
    return name.substring(0, 2).toUpperCase();
  };

  return {
    inquiries,
    loading,
    error,
    getInquiriesByStatus,
    updateStatus,
    formatDate,
    getUserInitials,
    // Status counts
    totalCount: inquiries.length,
    pendingCount: getInquiriesByStatus('pending').length,
    approvedCount: getInquiriesByStatus('approved').length,
    rejectedCount: getInquiriesByStatus('rejected').length,
  };
};
