"use client";
import React from "react";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";

const AdminLayout = ({
  children
}) => {
  // Request notification permission on app load
  useNotificationPermission();

  return (
    <div className="flex w-full font-sora gap-6 h-full bg-[#F7F8FA] text-black">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto ml-56 mt-2 bg-white rounded-tl-4xl custom-shadow">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
