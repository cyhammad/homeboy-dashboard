"use client";

import React, { useEffect } from "react";
import Graphs from "./(home)/dashboard/components/Graph";
import Card from "@/components/Card/Card";
import { useFirebase } from "@/context/FirebaseContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { useModal } from "@/context/ModalContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminNotificationInitializer from "@/components/AdminNotificationInitializer";
import AdminFCMInitializer from "@/components/AdminFCMInitializer";

const Dashboard = () => {
  const { user } = useAuth();
  const { data, stats, loading, error } = useFirebase();
  const { trackEvent, trackUserAction } = useAnalytics('/dashboard', user?.uid);
  const { isModalOpen } = useModal();


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
    <ProtectedRoute>
      <AdminNotificationInitializer />
      <AdminFCMInitializer />
      {isModalOpen && (
        <div className="min-h-screen bg-black/20 w-full absolute z-10"></div>
      )}
      <div className="flex w-full font-sora gap-6 h-full overflow-y-auto max-h-screen bg-[#F7F8FA] text-black">
        <div className="">
          <Sidebar />
        </div>
        <div className="flex flex-col w-full h-full min-h-screen ml-56 mt-2 bg-white rounded-tl-4xl custom-shadow">
          <Header />
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
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
