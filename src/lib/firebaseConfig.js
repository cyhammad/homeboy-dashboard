import { 
  COLLECTIONS, 
  FIELDS, 
  STATUS, 
  ROLES, 
  PROPERTY_TYPES, 
  INQUIRY_TYPES, 
  NOTIFICATION_TYPES 
} from './firebase';

/**
 * Firebase Configuration Helper
 * Provides easy access to all Firebase configuration constants
 */

// Collection Names
export const Collections = COLLECTIONS;

// Field Names
export const Fields = FIELDS;

// Status Values
export const Status = STATUS;

// User Roles
export const Roles = ROLES;

// Property Types
export const PropertyTypes = PROPERTY_TYPES;

// Inquiry Types
export const InquiryTypes = INQUIRY_TYPES;

// Notification Types
export const NotificationTypes = NOTIFICATION_TYPES;

/**
 * Get all available collections
 * @returns {Object} Collection names
 */
export const getCollections = () => Collections;

/**
 * Get all available field names
 * @returns {Object} Field names
 */
export const getFields = () => Fields;

/**
 * Get all available status values
 * @returns {Object} Status values
 */
export const getStatus = () => Status;

/**
 * Get all available roles
 * @returns {Object} Role values
 */
export const getRoles = () => Roles;

/**
 * Get all available property types
 * @returns {Object} Property type values
 */
export const getPropertyTypes = () => PropertyTypes;

/**
 * Get all available inquiry types
 * @returns {Object} Inquiry type values
 */
export const getInquiryTypes = () => InquiryTypes;

/**
 * Get all available notification types
 * @returns {Object} Notification type values
 */
export const getNotificationTypes = () => NotificationTypes;

/**
 * Validate if a status is valid
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
export const isValidStatus = (status) => {
  return Object.values(Status).includes(status);
};

/**
 * Validate if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid
 */
export const isValidRole = (role) => {
  return Object.values(Roles).includes(role);
};

/**
 * Validate if a property type is valid
 * @param {string} propertyType - Property type to validate
 * @returns {boolean} True if valid
 */
export const isValidPropertyType = (propertyType) => {
  return Object.values(PropertyTypes).includes(propertyType);
};

/**
 * Validate if an inquiry type is valid
 * @param {string} inquiryType - Inquiry type to validate
 * @returns {boolean} True if valid
 */
export const isValidInquiryType = (inquiryType) => {
  return Object.values(InquiryTypes).includes(inquiryType);
};

/**
 * Validate if a notification type is valid
 * @param {string} notificationType - Notification type to validate
 * @returns {boolean} True if valid
 */
export const isValidNotificationType = (notificationType) => {
  return Object.values(NotificationTypes).includes(notificationType);
};

/**
 * Get default values for a new user document
 * @param {Object} userData - User data
 * @returns {Object} Default user document
 */
export const getDefaultUserDocument = (userData) => {
  return {
    uid: userData.uid,
    email: userData.email,
    displayName: userData.displayName || '',
    role: userData.role || Roles.ADMIN,
    isAdmin: userData.isAdmin !== undefined ? userData.isAdmin : true,
    status: Status.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null
  };
};

/**
 * Get default values for a new listing document
 * @param {Object} listingData - Listing data
 * @returns {Object} Default listing document
 */
export const getDefaultListingDocument = (listingData) => {
  return {
    ...listingData,
    status: Status.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Get default values for a new inquiry document
 * @param {Object} inquiryData - Inquiry data
 * @returns {Object} Default inquiry document
 */
export const getDefaultInquiryDocument = (inquiryData) => {
  return {
    ...inquiryData,
    status: Status.PENDING,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Get default values for a new notification document
 * @param {Object} notificationData - Notification data
 * @returns {Object} Default notification document
 */
export const getDefaultNotificationDocument = (notificationData) => {
  return {
    ...notificationData,
    read: false,
    createdAt: new Date().toISOString()
  };
};

/**
 * Get configuration summary
 * @returns {Object} Configuration summary
 */
export const getConfigSummary = () => {
  return {
    collections: Object.keys(Collections).length,
    fields: Object.keys(Fields).length,
    statuses: Object.keys(Status).length,
    roles: Object.keys(Roles).length,
    propertyTypes: Object.keys(PropertyTypes).length,
    inquiryTypes: Object.keys(InquiryTypes).length,
    notificationTypes: Object.keys(NotificationTypes).length
  };
};
