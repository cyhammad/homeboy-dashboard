"use client";
import React, { useState } from "react";
import DetailsTable from "./_components/DetailsTable";
import DetailsModal from "./_components/DetailsModal";

import { useRouter } from "next/navigation";
import { useModal } from "@/context/ModalContext";

const Bookings = () => {
  const [showModal, setShowModal] = useState(false);
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const toggleModal = () => {
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
            <DetailsTable setShowModal={toggleModal} />
          </div>
        </div>
      </div>
      {showModal && (
        <div className="p-4">
          <DetailsModal
            onclose={() => {
              setShowModal(false);
              closeModal();
            }}
          />
        </div>
      )}
    </>
  );
};

export default Bookings;
