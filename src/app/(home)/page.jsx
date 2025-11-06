"use client";

import React from "react";
import Graphs from "@/components/dashboard/Graph";
import Card from "@/components/Card/Card";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { dashboardData, listings, users, loading } = useDashboardData();

  if (loading) {
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
          <Graphs users={users} listings={listings} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
