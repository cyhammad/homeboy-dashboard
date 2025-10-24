"use client";
import React, { useState } from "react";
import Link from "next/link";
import LogoutIcon from "@/assets/icons/Logout";
import ListingIcon from "@/assets/icons/Listing";
import LocationIcon from "@/assets/icons/Location";
import { usePathname } from "next/navigation";
import LogoutModal from "../logout-modal/LogoutModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LayoutDashboardIcon } from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname(); // Get the current URL path
  // const [openMenu, setOpenMenu] = useState(null); // Track the currently open menu

  const links = [
    {
      href: "/",
      label: "Dashboard",
      icon: (
        <LayoutDashboardIcon
          size={20}
          className={pathname === "/" ? "text-white" : "text-black"}
        />
      ),
    },
    {
      href: "/listing-requests",
      label: "Listing Requests",
      icon: (
        <ListingIcon
          size={20}
          color={pathname.includes("/listing-requests") ? "white" : "black"}
        />
      ),
    },
    {
      href: "/inquiry-requests",
      label: "Inquiry Requests",
      icon: (
        <LocationIcon
          size={20}
          color={pathname.includes("/inquiry-requests") ? "white" : "black"}
        />
      ),
    },
  ];

  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    setShowLogout(true);
  };

  return (
    <>
      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Logout Confirmation</DialogTitle>
          </DialogHeader>
          <LogoutModal onclose={() => setShowLogout(false)} />
        </DialogContent>
      </Dialog>
      <div className="fixed md:flex flex-1 h-screen w-40 md:w-60 flex-col gap-10 custom-shadow border-black/20 px-6 py-6 text-[#4D5154]">
        <div className="flex gap-2 items-center text-3xl font-medium py-3 border-b border-b-black/20">
          <p className="text-xl font-semibold">LOGO</p>
        </div>
        <div className="flex flex-col h-full justify-between">
          <div className="">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex-col md:flex-row text-sm flex items-center px-2 py-3 gap-4 rounded-lg ${
                  pathname === link.href ? "bg-primary text-white" : ""
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="">
            <button
              onClick={handleLogout}
              className={`relative flex-col cursor-pointer md:flex-row text-sm flex items-center p-2 gap-4 rounded-lg`}
            >
              <span>{<LogoutIcon size={20} />}</span>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
