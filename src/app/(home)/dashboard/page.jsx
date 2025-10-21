"use client";

import React, { useEffect } from "react";
import Graphs from "./components/Graph";
import Card from "@/components/Card/Card";
import { useFirebase } from "@/context/FirebaseContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { data, stats, loading, error } = useFirebase();
  const { trackEvent, trackUserAction } = useAnalytics('/dashboard', user?.uid);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard Data:', data);
    console.log('Dashboard Stats:', stats);
    console.log('Inquiries:', data?.inquiries);
  }, [data, stats]);

  // Generate card data from Firebase stats with real-time calculations
  const CARD_DATA = [
    {
      name: "Total Users",
      amount: stats.totalUsers.toString(),
      percent: Math.abs(stats.usersGrowth || 0),
      status: stats.usersGrowth > 0 ? "up" : "down",
    },
    {
      name: "Total Listings", 
      amount: stats.totalListings.toString(),
      percent: Math.abs(stats.listingsGrowth || 0),
      status: stats.listingsGrowth > 0 ? "up" : "down",
    },
    {
      name: "Inquiry Requests",
      amount: stats.totalInquiries.toString(),
      percent: Math.abs(stats.inquiriesGrowth || 0),
      status: stats.inquiriesGrowth > 0 ? "up" : "down",
    }
  ];

  // Debug logging to help troubleshoot
  console.log('Growth Debug:', {
    users: { current: stats.debug?.currentMonthUsers, previous: stats.debug?.previousMonthUsers, growth: stats.usersGrowth },
    listings: { current: stats.debug?.currentMonthListings, previous: stats.debug?.previousMonthListings, growth: stats.listingsGrowth },
    inquiries: { current: stats.debug?.currentMonthInquiries, previous: stats.debug?.previousMonthInquiries, growth: stats.inquiriesGrowth }
  });

  // Track dashboard interactions
  const handleCardClick = (cardName) => {
    trackUserAction('card_click', cardName);
  };

  if (loading) {
    return (
      <div className="min-h-screen px-8 py-4 font-sora flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-8 py-4 font-sora flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard: {error}</p>
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
          {CARD_DATA.map((item, index) => (
            <div 
              className="flex flex-1 cursor-pointer" 
              key={index}
              onClick={() => handleCardClick(item.name)}
            >
              <Card data={item} index={index} />
            </div>
          ))}
        </div>

        {/* Graph Section */}
        <div className="py-4">
          <Graphs data={data} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
