"use client";
import React, { useState } from "react";
import DetailsTable from "./_components/DetailsTable";
import DetailsModal from "./_components/DetailsModal";
import CancelledTable from "./_components/CancelledTable";

import { useModal } from "@/context/ModalContext";
import PendingTable from "./_components/PendingTable";
import CreateModal from "./_components/CreateModal";

const ListingRequests = () => {
  const [currentButton, setCurrentButton] = useState("Approved");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { openModal, closeModal } = useModal();

  const toggleModal = () => {
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
            <div className="flex justify-end">
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
            {currentButton == "Approved" && (
              <DetailsTable setShowModal={toggleModal} />
            )}
            {currentButton == "Pending" && (
              <PendingTable setShowModal={toggleModal} />
            )}
            {currentButton == "Rejected" && (
              <CancelledTable setShowModal={toggleModal} />
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="p-4">
          <DetailsModal
            status={currentButton}
            onclose={() => {
              setShowModal(false);
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