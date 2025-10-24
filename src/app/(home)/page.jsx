"use client";

import React, { useMemo } from "react";
import Graphs from "@/components/dashboard/Graph";
import Card from "@/components/Card/Card";
import { useAllListings } from "@/hooks/useListings";
import { useAllInquiries } from "@/hooks/useInquiries";

const Dashboard = () => {
  const { listings, loading: listingsLoading } = useAllListings();
  const { inquiries, loading: inquiriesLoading } = useAllInquiries();

  // Calculate dashboard metrics
  const dashboardData = useMemo(() => {
    if (listingsLoading || inquiriesLoading) {
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

    const totalListings = listings?.length || 0;
    const totalInquiries = inquiries?.length || 0;
    
    // Calculate approved listings
    const approvedListings = listings?.filter(listing => 
      listing.status?.toLowerCase() === 'approved'
    ).length || 0;
    
    // Calculate approved inquiries
    const approvedInquiries = inquiries?.filter(inquiry => 
      inquiry.status?.toLowerCase() === 'approved'
    ).length || 0;

    // Calculate growth percentages (mock data for now - you can implement real calculations)
    const listingGrowth = totalListings > 0 ? Math.floor(Math.random() * 20) + 5 : 0;
    const inquiryGrowth = totalInquiries > 0 ? Math.floor(Math.random() * 15) + 10 : 0;
    const userGrowth = Math.floor(Math.random() * 30) + 10;

    return [
      {
        name: "Total Users",
        amount: "256", // This would come from a users collection if available
        percent: userGrowth,
        status: "up",
      },
      {
        name: "Total Listings",
        amount: totalListings.toString(),
        percent: listingGrowth,
        status: listingGrowth > 10 ? "up" : "down",
      },
      {
        name: "Inquiry Requests",
        amount: totalInquiries.toString(),
        percent: inquiryGrowth,
        status: inquiryGrowth > 10 ? "up" : "down",
      }
    ];
  }, [listings, inquiries, listingsLoading, inquiriesLoading]);

  if (listingsLoading || inquiriesLoading) {
    return (
      <div className="min-h-screen px-8 py-4 font-sora flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-4 font-sora">
      <div className="flex flex-col gap-4">
        {/* Page Title */}
        <div className="flex flex-col gap-1 py-2">
          <p className="text-2xl font-bold text-new-black">Dashboard</p>
          <p className="text-new-grey text-sm">
            <span className="text-primary">Dashboard</span> / Home
          </p>
        </div>

        {/* Cards */}
        <div className="flex py-1 rounded-2xl custom-shadow-1">
          {dashboardData.map((item, index) => (
            <div className="flex flex-1" key={index}>
              <Card data={item} index={index} />
            </div>
          ))}
        </div>

        {/* Graph Section */}
        <div className="py-4">
          <Graphs listings={listings} inquiries={inquiries} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
