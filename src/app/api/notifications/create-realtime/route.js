import { NextResponse } from "next/server";
import { createNotification } from "@/lib/firebaseUtils";

export async function POST(request) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data are required" },
        { status: 400 }
      );
    }

    let notificationData;

    if (type === 'listing') {
      const ownerName = data.ownerName || data.owner || 'Property Owner';
      const propertyTitle = data.title || 'Property';
      
      notificationData = {
        title: "New Listing Request",
        description: `${ownerName} submitted a new property listing`,
        userId: 'admin',
        type: 'listing',
        data: {
          type: 'listing',
          listingId: data.id,
          ownerName: ownerName,
          propertyTitle: propertyTitle,
          source: 'mobile-app'
        },
        isSeen: false
      };
    } else if (type === 'inquiry') {
      const inquirerName = data.inquirerName || data.buyerName || 'Someone';
      const propertyId = data.listingId || data.propertyId || data.id;
      
      notificationData = {
        title: "New Inquiry",
        description: `${inquirerName} is interested in a property`,
        userId: 'admin',
        type: 'inquiry',
        data: {
          type: 'inquiry',
          inquiryId: data.id,
          inquirerName: inquirerName,
          propertyId: propertyId,
          source: 'mobile-app'
        },
        isSeen: false
      };
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'listing' or 'inquiry'" },
        { status: 400 }
      );
    }

    const notification = await createNotification(notificationData);

    console.log('Realtime notification created:', notification);

    return NextResponse.json({
      success: true,
      notification: notification
    });

  } catch (error) {
    console.error('Error creating realtime notification:', error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
