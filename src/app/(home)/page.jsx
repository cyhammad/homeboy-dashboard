"use client";

import React from "react";
import Graphs from "@/components/dashboard/Graph";
import Card from "@/components/Card/Card";
import { CARD_DATA } from "@/constants/cards";

const Dashboard = () => {
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
            <div className="flex flex-1" key={index}>
              <Card data={item} index={index} />
            </div>
          ))}
        </div>

        {/* Graph Section */}
        <div className="py-4">
          <Graphs />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
