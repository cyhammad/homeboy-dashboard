"use client";
import Image from "next/image";
import UserAvatar from "./useravatar.png";
import DetailsModal from "./DetailsModal";
import BellIcon from "@/assets/icons/Bell";

import { useState } from "react";
import { useModal } from "@/context/ModalContext";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
    const { openModal, closeModal } = useModal();

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowModal(true);
    openModal();
  };

  const [showModal, setShowModal] = useState(false);
  const closeModals = () => {
    setShowModal(false);
  };

  return (
    <>
      <header className="flex md:justify-between items-center md:gap-10 px-3 border-b border-black/20">
        <div className="flex justify-end items-center w-full ">
          <div className="flex md:justify-between items-center md:gap-10 px-3 md:px-4 py-3 ml-3 md:ml-0 relative">
            <div className="relative left-2 flex gap-5">
              <button
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full"
                aria-label="Notifications"
                onClick={handleNotificationClick}
              >
                <BellIcon size={24} />
              </button>
            </div>
            <div className="flex items-center border-l border-[#D6D6D666]">
              <button
                className="flex items-center space-x-3 focus:outline-none"
                aria-label="Profile"
              >
                <Image
                  src={UserAvatar}
                  alt="Profile"
                  width={50}
                  height={50}
                  className="rounded-full h-12 w-12 border"
                />
              </button>
            </div>
          </div>
        </div>
      </header>
      {showModal && (
        <div className="p-4">
          <DetailsModal
            onclose={() => {
              setShowModal(false);
              closeModals()
              closeModal();
            }}
          />
        </div>
      )}
    </>
  );
};

export default Header;
