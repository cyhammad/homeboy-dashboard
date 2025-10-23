import {
  createListing,
  createInquiry,
  createNotification,
  recordAnalytics
} from './firebaseUtils';
import { PROPERTY_TYPES, INQUIRY_TYPES, NOTIFICATION_TYPES } from './firebase';

// Sample listings data
export const sampleListings = [
  {
    title: "Modern 2BR Apartment in Downtown",
    description: "Beautiful modern apartment with stunning city views. Recently renovated with high-end finishes.",
    price: 2800,
    location: "Downtown, New York",
    propertyType: PROPERTY_TYPES.APARTMENT,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800"
    ],
    ownerId: "owner_001",
    ownerName: "John Smith",
    ownerEmail: "john.smith@example.com",
    ownerPhone: "+1-555-0123"
  },
  {
    title: "Luxury 3BR House with Garden",
    description: "Spacious family home with private garden and garage. Perfect for families.",
    price: 4500,
    location: "Brooklyn, New York",
    propertyType: PROPERTY_TYPES.HOUSE,
    bedrooms: 3,
    bathrooms: 3,
    area: 2000,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
    ],
    ownerId: "owner_002",
    ownerName: "Sarah Johnson",
    ownerEmail: "sarah.johnson@example.com",
    ownerPhone: "+1-555-0124"
  },
  {
    title: "Cozy Studio in Manhattan",
    description: "Perfect studio apartment for young professionals. Close to public transportation.",
    price: 2200,
    location: "Manhattan, New York",
    propertyType: PROPERTY_TYPES.STUDIO,
    bedrooms: 0,
    bathrooms: 1,
    area: 500,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    ],
    ownerId: "owner_003",
    ownerName: "Mike Davis",
    ownerEmail: "mike.davis@example.com",
    ownerPhone: "+1-555-0125"
  }
];

// Sample inquiries data
export const sampleInquiries = [
  {
    listingId: "", // Will be set after listing creation
    inquirerName: "Alice Brown",
    inquirerEmail: "alice.brown@example.com",
    inquirerPhone: "+1-555-0201",
    message: "Hi, I'm very interested in this property. Could I schedule a viewing for this weekend?",
    inquiryType: INQUIRY_TYPES.VIEWING,
    priority: "high"
  },
  {
    listingId: "", // Will be set after listing creation
    inquirerName: "Bob Wilson",
    inquirerEmail: "bob.wilson@example.com",
    inquirerPhone: "+1-555-0202",
    message: "Is the rent negotiable? I'm looking for a long-term lease.",
    inquiryType: INQUIRY_TYPES.PRICE_INQUIRY,
    priority: "medium"
  },
  {
    listingId: "", // Will be set after listing creation
    inquirerName: "Carol Taylor",
    inquirerEmail: "carol.taylor@example.com",
    inquirerPhone: "+1-555-0203",
    message: "When is this property available? I need to move in by next month.",
    inquiryType: INQUIRY_TYPES.AVAILABILITY,
    priority: "high"
  }
];

// Sample notifications data
export const sampleNotifications = [
  {
    userId: "admin_001", // Replace with actual admin user ID
    title: "New Inquiry Received",
    message: "A new inquiry has been received for the Modern 2BR Apartment",
    type: NOTIFICATION_TYPES.NEW_INQUIRY,
    actionUrl: "/inquiries"
  },
  {
    userId: "admin_001",
    title: "Listing Status Updated",
    message: "The Luxury 3BR House status has been changed to approved",
    type: NOTIFICATION_TYPES.SYSTEM_UPDATE,
    actionUrl: "/listings"
  },
  {
    userId: "admin_001",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur tonight from 2-4 AM",
    type: NOTIFICATION_TYPES.ALERT,
    actionUrl: "/settings"
  }
];

// Sample analytics data
export const sampleAnalytics = [
  { metric: "page_views", value: 150, dimensions: { page: "/dashboard" } },
  { metric: "page_views", value: 75, dimensions: { page: "/listings" } },
  { metric: "page_views", value: 45, dimensions: { page: "/inquiries" } },
  { metric: "user_signups", value: 3, dimensions: { source: "signup_page" } },
  { metric: "inquiries_received", value: 8, dimensions: { type: "viewing" } },
  { metric: "listings_created", value: 5, dimensions: { status: "pending" } }
];

/**
 * Seed the database with sample data
 * @param {string} adminUserId - Admin user ID to associate data with
 * @returns {Promise<void>}
 */
export const seedDatabase = async (adminUserId) => {
  try {
    console.log("🌱 Starting database seeding...");

    // Create sample listings
    const createdListings = [];
    for (const listing of sampleListings) {
      const createdListing = await createListing(listing);
      createdListings.push(createdListing);
      console.log(`✅ Created listing: ${createdListing.title}`);
    }

    // Create sample inquiries
    const createdInquiries = [];
    for (let i = 0; i < sampleInquiries.length; i++) {
      const inquiry = {
        ...sampleInquiries[i],
        listingId: createdListings[i % createdListings.length].id
      };
      const createdInquiry = await createInquiry(inquiry);
      createdInquiries.push(createdInquiry);
      console.log(`✅ Created inquiry: ${createdInquiry.inquirerName}`);
    }

    // Create sample notifications
    const notificationsWithUserId = sampleNotifications.map(notification => ({
      ...notification,
      userId: adminUserId
    }));

    for (const notification of notificationsWithUserId) {
      await createNotification(notification);
      console.log(`✅ Created notification: ${notification.title}`);
    }

    // Record sample analytics
    for (const analytics of sampleAnalytics) {
      await recordAnalytics(analytics.metric, analytics.value, analytics.dimensions);
    }
    console.log(`✅ Recorded ${sampleAnalytics.length} analytics entries`);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Created: ${createdListings.length} listings, ${createdInquiries.length} inquiries, ${notificationsWithUserId.length} notifications`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

/**
 * Clear all sample data from the database
 * @returns {Promise<void>}
 */
export const clearSampleData = async () => {
  try {
    // Note: In production, you'd want to be more specific about what to delete
    // This is a placeholder for the clear operation
  } catch (error) {
    console.error("❌ Error clearing sample data:", error);
    throw error;
  }
};

/**
 * Get sample data statistics
 * @returns {Object} Statistics about sample data
 */
export const getSampleDataStats = () => {
  return {
    listings: sampleListings.length,
    inquiries: sampleInquiries.length,
    notifications: sampleNotifications.length,
    analytics: sampleAnalytics.length,
    totalRecords: sampleListings.length + sampleInquiries.length + sampleNotifications.length + sampleAnalytics.length
  };
};
