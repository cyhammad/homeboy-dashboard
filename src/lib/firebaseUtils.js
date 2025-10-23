import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage, COLLECTIONS, STATUS, ROLES } from './firebase';

// ==================== USER OPERATIONS ====================

/**
 * Create a new user document
 * @param {string} userId - Firebase Auth UID
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Created user document
 */
export const createUser = async (userId, userData) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName || '',
      role: userData.role || ROLES.ADMIN,
      isAdmin: userData.isAdmin || true,
      status: STATUS.ACTIVE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: null
    };
    
    await updateDoc(userRef, userDoc);
    return { id: userId, ...userDoc };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User document or null
 */
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Update user data
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, updateData) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Get all users
 * @param {number} limitCount - Number of users to fetch
 * @returns {Promise<Array>} Array of user documents
 */
export const getAllUsers = async (limitCount = 50) => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// ==================== LISTING OPERATIONS ====================

/**
 * Create a new listing
 * @param {Object} listingData - Listing data
 * @returns {Promise<Object>} Created listing document
 */
export const createListing = async (listingData) => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    const listingDoc = {
      ...listingData,
      status: STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(listingsRef, listingDoc);
    return { id: docRef.id, ...listingDoc };
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

/**
 * Get listing by ID
 * @param {string} listingId - Listing ID
 * @returns {Promise<Object|null>} Listing document or null
 */
export const getListingById = async (listingId) => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    const listingSnap = await getDoc(listingRef);
    
    if (listingSnap.exists()) {
      return { id: listingSnap.id, ...listingSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting listing:', error);
    throw error;
  }
};

/**
 * Get all listings with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of listing documents
 */
export const getListings = async (filters = {}) => {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    let q = query(listingsRef, orderBy('createdAt', 'desc'));
    
    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.propertyType) {
      q = query(q, where('propertyType', '==', filters.propertyType));
    }
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting listings:', error);
    throw error;
  }
};

/**
 * Update listing status
 * @param {string} listingId - Listing ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateListingStatus = async (listingId, status) => {
  try {
    const listingRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(listingRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    throw error;
  }
};

// ==================== INQUIRY OPERATIONS ====================

/**
 * Create a new inquiry
 * @param {Object} inquiryData - Inquiry data
 * @returns {Promise<Object>} Created inquiry document
 */
export const createInquiry = async (inquiryData) => {
  try {
    const inquiriesRef = collection(db, COLLECTIONS.INQUIRIES);
    const inquiryDoc = {
      ...inquiryData,
      status: STATUS.PENDING,
      priority: 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(inquiriesRef, inquiryDoc);
    return { id: docRef.id, ...inquiryDoc };
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

/**
 * Get all inquiries with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of inquiry documents
 */
export const getInquiries = async (filters = {}) => {
  try {
    const inquiriesRef = collection(db, COLLECTIONS.INQUIRIES);
    let q = query(inquiriesRef);
    
    // Try to order by requestedAt, if it fails, order by createdAt
    try {
      q = query(inquiriesRef, orderBy('requestedAt', 'desc'));
    } catch (orderError) {
      try {
        q = query(inquiriesRef, orderBy('createdAt', 'desc'));
      } catch (createdAtError) {
        q = query(inquiriesRef);
      }
    }
    
    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    const mappedInquiries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        inquiryId: doc.id,
        listingId: data.property?.id || data.id,
        inquirerName: data.buyerName,
        inquirerEmail: data.buyerEmail,
        inquirerPhone: data.buyerPhone,
        message: data.description,
        inquiryType: 'general',
        priority: 'medium',
        status: data.status?.toLowerCase() || 'pending',
        createdAt: data.requestedAt || data.createdAt,
        updatedAt: data.requestedAt || data.createdAt,
        property: data.property,
        userId: data.userId,
        ...data
      };
    });
    
    return mappedInquiries;
  } catch (error) {
    console.error('Error getting inquiries:', error);
    throw error;
  }
};

/**
 * Update inquiry status
 * @param {string} inquiryId - Inquiry ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateInquiryStatus = async (inquiryId, status) => {
  try {
    const inquiryRef = doc(db, COLLECTIONS.INQUIRIES, inquiryId);
    await updateDoc(inquiryRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
};

// ==================== NOTIFICATION OPERATIONS ====================

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification document
 */
export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const notificationDoc = {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notificationsRef, notificationDoc);
    return { id: docRef.id, ...notificationDoc };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of notifications to fetch
 * @returns {Promise<Array>} Array of notification documents
 */
export const getUserNotifications = async (userId, limitCount = 20) => {
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Get all notifications (for admin)
 * @param {number} limitCount - Number of notifications to fetch
 * @returns {Promise<Array>} Array of notification documents
 */
export const getNotifications = async (limitCount = 100) => {
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// ==================== ANALYTICS OPERATIONS ====================

/**
 * Record analytics data
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {Object} dimensions - Additional dimensions
 * @returns {Promise<void>}
 */
export const recordAnalytics = async (metric, value, dimensions = {}) => {
  try {
    const analyticsRef = collection(db, COLLECTIONS.ANALYTICS);
    await addDoc(analyticsRef, {
      metric,
      value,
      dimensions,
      date: serverTimestamp()
    });
  } catch (error) {
    console.error('Error recording analytics:', error);
    throw error;
  }
};

/**
 * Get analytics data
 * @param {string} metric - Metric name
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>} Array of analytics documents
 */
export const getAnalytics = async (metric, days = 30) => {
  try {
    const analyticsRef = collection(db, COLLECTIONS.ANALYTICS);
    const q = query(
      analyticsRef,
      where('metric', '==', metric),
      orderBy('date', 'desc'),
      limit(days)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Listen to real-time updates for a collection
 * @param {string} collectionName - Collection name
 * @param {Function} callback - Callback function
 * @param {Object} filters - Filter options
 * @returns {Function} Unsubscribe function
 */
export const listenToCollection = (collectionName, callback, filters = {}) => {
  try {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef);
    
    // Try to add ordering, but handle errors gracefully
    try {
      if (collectionName === COLLECTIONS.INQUIRIES) {
        // For inquiries, try requestedAt first, then createdAt
        try {
          q = query(collectionRef, orderBy('requestedAt', 'desc'));
        } catch (err) {
          q = query(collectionRef, orderBy('createdAt', 'desc'));
        }
      } else {
        q = query(collectionRef, orderBy('createdAt', 'desc'));
      }
    } catch (orderError) {
      q = query(collectionRef);
    }
    
    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    // Add metadata to reduce unnecessary updates
    return onSnapshot(q, { 
      includeMetadataChanges: false // Only trigger on actual data changes
    }, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  } catch (error) {
    console.error('Error setting up listener:', error);
    throw error;
  }
};

// ==================== BATCH OPERATIONS ====================

/**
 * Delete multiple documents in a batch
 * @param {Array} docIds - Array of document IDs
 * @param {string} collectionName - Collection name
 * @returns {Promise<void>}
 */
export const batchDelete = async (docIds, collectionName) => {
  try {
    const batch = writeBatch(db);
    
    docIds.forEach(id => {
      const docRef = doc(db, collectionName, id);
      batch.delete(docRef);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch deleting:', error);
    throw error;
  }
};

/**
 * Update multiple documents in a batch
 * @param {Array} updates - Array of {id, data} objects
 * @param {string} collectionName - Collection name
 * @returns {Promise<void>}
 */
export const batchUpdate = async (updates, collectionName) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const docRef = doc(db, collectionName, id);
      batch.update(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch updating:', error);
    throw error;
  }
};

// ==================== FILE UPLOAD OPERATIONS ====================

/**
 * Upload a file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g., 'listings/images')
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `${path}/${fileName}`);
    
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files to Firebase Storage
 * @param {File[]} files - Array of files to upload
 * @param {string} path - Storage path (e.g., 'listings/images')
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadMultipleFiles = async (files, path) => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, path));
    const downloadURLs = await Promise.all(uploadPromises);
    
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} downloadURL - Download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (downloadURL) => {
  try {
    const fileRef = ref(storage, downloadURL);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Create a listing with image uploads
 * @param {Object} listingData - Listing data
 * @param {File[]} imageFiles - Array of image files
 * @returns {Promise<Object>} Created listing document
 */
export const createListingWithImages = async (listingData, imageFiles = []) => {
  try {
    let imageUrls = [];
    
    // Upload images if provided
    if (imageFiles.length > 0) {
      imageUrls = await uploadMultipleFiles(imageFiles, 'listings/images');
    }
    
    // Create listing document
    const listingDoc = {
      ...listingData,
      imageUrls,
      status: STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    const docRef = await addDoc(listingsRef, listingDoc);
    
    return { id: docRef.id, ...listingDoc };
  } catch (error) {
    console.error('Error creating listing with images:', error);
    throw error;
  }
};
