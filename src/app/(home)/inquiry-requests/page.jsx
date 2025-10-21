"use client";
import React, { useState } from "react";
import DetailsTable from "./_components/DetailsTable";
import DetailsModal from "./_components/DetailsModal";

import { useRouter } from "next/navigation";
import { useModal } from "@/context/ModalContext";
import { useInquiryRequests } from "@/hooks/useInquiryRequests";

const Bookings = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  
  const { 
    inquiries, 
    loading, 
    error, 
    updateStatus,
    formatDate,
    getUserInitials,
    totalCount
  } = useInquiryRequests();
  
  const toggleModal = (inquiry = null) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
    openModal();
  };
  return (
    <>
      <div className="min-h-screen px-8 py-2 font-sora">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1 ">
              <p
                className="text-2xl font-bold cursor-pointer"
                onClick={() => {
                  router.back();
                }}
              >
                Dashboard
              </p>
              <p className="text-sm">
                <span className="text-primary"> Dashboard </span> / Inquiry
                Requests
              </p>
            </div>
          </div>
          <div className="flex gap-4 flex-col px-8 py-4 border border-black/10 rounded-2xl bg-white">
            <div className="flex items-center justify-between py-4 border-b border-b-black/20">
              <p className="font-semibold text-black/60">Inquiry Requests</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="ml-2 text-gray-600">Loading inquiries...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-red-600">Error loading inquiries: {error}</p>
              </div>
            ) : (
              <DetailsTable 
                setShowModal={toggleModal} 
                inquiries={inquiries}
                updateStatus={updateStatus}
                formatDate={formatDate}
                getUserInitials={getUserInitials}
              />
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="p-4">
          <DetailsModal
            inquiry={selectedInquiry}
            updateStatus={updateStatus}
            onclose={() => {
              setShowModal(false);
              setSelectedInquiry(null);
              closeModal();
            }}
          />
        </div>
      )}
    </>
  );
};

export default Bookings;
