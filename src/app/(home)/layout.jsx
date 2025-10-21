"use client";
import React from "react";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { useModal } from "@/context/ModalContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const AdminLayout = ({
  children
}) => {
  const { isModalOpen } = useModal();
  return (
    <ProtectedRoute>
      {isModalOpen && (
        <div className="min-h-screen bg-black/20 w-full absolute z-10"></div>
      )}
      <div className="flex w-full font-sora gap-6 h-full overflow-y-auto max-h-screen bg-[#F7F8FA] text-black">
        <div className="">
          <Sidebar />
        </div>
        <div className="flex flex-col w-full h-full min-h-screen ml-56 mt-2 bg-white rounded-tl-4xl custom-shadow">
          <Header />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
