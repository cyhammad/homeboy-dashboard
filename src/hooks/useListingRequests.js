import { useState, useEffect } from 'react';
import { updateListingStatus } from '@/lib/firebaseUtils';
import { useFirebase } from '@/context/FirebaseContext';

export const useListingRequests = () => {
  const { data } = useFirebase();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use listings from Firebase context
        const listingsData = data.listings || [];
        
        // Map the data to match the expected structure
        const mappedListings = listingsData.map(listing => ({
          id: listing.id,
          listingId: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location: listing.location,
          status: listing.status,
          userId: listing.userId,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          imageUrls: listing.imageUrls || [],
          likedBy: listing.likedBy || [],
          sharedBy: listing.sharedBy || [],
          ...listing
        }));
        
        setListings(mappedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [data.listings]);

  // Filter listings by status
  const getListingsByStatus = (status) => {
    return listings.filter(listing => 
      listing.status?.toLowerCase() === status.toLowerCase()
    );
  };

  // Update listing status
  const updateStatus = async (listingId, newStatus) => {
    try {
      await updateListingStatus(listingId, newStatus);
      
      // Update local state
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: newStatus, updatedAt: new Date().toISOString() }
            : listing
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating listing status:', error);
      throw error;
    }
  };

  // Get user info for a listing (you might need to implement this based on your user data structure)
  const getUserInfo = () => {
    // This would need to be implemented based on your user data structure
    // For now, return a default user
    return {
      name: 'Property Owner',
      initials: 'PO',
      email: 'owner@example.com'
    };
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

  return {
    listings,
    loading,
    error,
    getListingsByStatus,
    updateStatus,
    getUserInfo,
    formatDate,
    // Status counts
    approvedCount: getListingsByStatus('approved').length,
    pendingCount: getListingsByStatus('pending').length,
    rejectedCount: getListingsByStatus('rejected').length,
  };
};
