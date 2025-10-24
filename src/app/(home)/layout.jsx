import React from "react";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/sidebar/Sidebar";

const AdminLayout = ({
  children
}) => {
  return (
    <div className="flex w-full font-sora gap-6 h-full max-h-screen bg-[#F7F8FA] text-black">
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
