"use client";
import React from "react";
import Link from "next/link";
import LogoutIcon from "@/assets/icons/Logout";
import ListingIcon from "@/assets/icons/Listing";
import LocationIcon from "@/assets/icons/Location";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboardIcon } from "lucide-react";
import Swal from "sweetalert2";

const Sidebar = () => {
  const pathname = usePathname(); // Get the current URL path
  const router = useRouter();

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

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      // Redirect to login
      router.push('/login');
    }
  };

  return (
    <>
      <div className="fixed md:flex flex-1 h-screen w-40 md:w-60 flex-col gap-10 custom-shadow border-black/20 px-6 py-6 text-[#4D5154]">
        <div className="flex gap-2 items-center text-3xl font-medium py-3 border-b border-b-black/20">
          <p className="text-xl font-semibold">Deal Swipe</p>
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
