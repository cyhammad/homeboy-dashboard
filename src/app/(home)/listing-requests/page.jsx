"use client";
import React, { useState } from "react";
import DetailsTable from "./_components/DetailsTable";
import DetailsModal from "./_components/DetailsModal";
import CancelledTable from "./_components/CancelledTable";

import { useModal } from "@/context/ModalContext";
import PendingTable from "./_components/PendingTable";
import CreateModal from "./_components/CreateModal";
import { useListingRequests } from "@/hooks/useListingRequests";

const ListingRequests = () => {
  const [currentButton, setCurrentButton] = useState("Approved");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const { openModal, closeModal } = useModal();
  
  const { 
    listings, 
    loading, 
    error, 
    getListingsByStatus, 
    updateStatus,
    approvedCount,
    pendingCount,
    rejectedCount 
  } = useListingRequests();

  const toggleModal = (listing = null) => {
    setSelectedListing(listing);
    setShowModal(true);
    openModal();
  };
  return (
    <>
      <div className="min-h-screen px-8 py-2 font-sora">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-bold text-new-black">Dashobard</p>
              <p className="text-new-grey text-sm">
                <span className="text-primary">Dashboard</span> / Listing
                Requests
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <p onClick={() =>{setShowCreateModal(true); openModal()}} className="flex bg-primary text-sm hover:bg-primary/90 cursor-pointer text-white px-3 py-2 rounded-xl ">
                Create Listing
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 flex-col px-8 py-4 border border-black/10 rounded-2xl bg-white">
            <div className="flex items-center justify-between py-4 border-b border-b-black/20">
              <p className="font-semibold text-black/60">Listing Requests</p>
            </div>
            <div className="flex">
              <div className="flex gap-2 border-b-[#90929414] border-b-2">
                <p
                  onClick={() => {
                    setCurrentButton("Approved");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "Approved" &&
                    "bg-white text-black/60 border-b-4 border-b-primary font-bold"
                  } cursor-pointer text-sm`}
                >
                  Approved
                </p>
                <p
                  onClick={() => {
                    setCurrentButton("Pending");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "Pending" &&
                    "bg-white border-b-4 border-b-primary text-black/60 font-bold"
                  } cursor-pointer text-sm`}
                >
                  Pending
                </p>
                <p
                  onClick={() => {
                    setCurrentButton("Rejected");
                  }}
                  className={`py-2 px-4 text-[#A6A8A9] ${
                    currentButton == "Rejected" &&
                    "bg-white border-b-4 border-b-primary text-black/60 font-bold"
                  } cursor-pointer text-sm`}
                >
                  Rejected
                </p>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="ml-2 text-gray-600">Loading listings...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-red-600">Error loading listings: {error}</p>
              </div>
            ) : (
              <>
                {currentButton == "Approved" && (
                  <DetailsTable 
                    setShowModal={(listing) => toggleModal(listing)} 
                    listings={getListingsByStatus('approved')}
                    updateStatus={updateStatus}
                  />
                )}
                {currentButton == "Pending" && (
                  <PendingTable 
                    setShowModal={(listing) => toggleModal(listing)} 
                    listings={getListingsByStatus('pending')}
                    updateStatus={updateStatus}
                  />
                )}
                {currentButton == "Rejected" && (
                  <CancelledTable 
                    setShowModal={(listing) => toggleModal(listing)} 
                    listings={getListingsByStatus('rejected')}
                    updateStatus={updateStatus}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="p-4">
          <DetailsModal
            status={currentButton}
            listing={selectedListing}
            updateStatus={updateStatus}
            onclose={() => {
              setShowModal(false);
              setSelectedListing(null);
              closeModal();
            }}
          />
        </div>
      )}
      {showCreateModal && (
        <div className="p-4">
          <CreateModal
            status={currentButton}
            onclose={() => {
              setShowCreateModal(false);
              closeModal();
            }}
          />
        </div>
      )}
    </>
  );
};

export default ListingRequests;