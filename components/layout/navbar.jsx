"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { FaBell } from "react-icons/fa";

//import profileDefault from "@/public/profile-default.png"; // Add a default profile image to /public

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  function getDashboardLink(role) {
    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return "/dashboard/admin";
      case "COORDINATOR":
        return "/dashboard/coordinator";
      case "MANAGER":
        return "/dashboard/manager";
      case "DRIVER":
        return "/dashboard/driver";
      case "PUBLIC": 
        return "/dashboard/public";
      default:
        return null;
    }
  }

  return (
    <nav
      className="bg-blue-700 border-b border-blue-500"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-white font-semibold text-lg">
            NEAT Booking App
          </Link>

          {/* Right-hand side */}
          {session && (
            <div className="flex items-center space-x-4">
              {/* Dashboard link */}
              {user && getDashboardLink(user.role) && (
                <Link
                  href={getDashboardLink(user.role)}
                  className="text-sm font-medium text-white bg-black hover:bg-gray-800 transition px-4 py-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Dashboard
                </Link>
              )}

              {/* Notification Bell */}
              <Link href="/messages" className="relative">
                <span className="sr-only">View messages</span>
                <FaBell className="text-white h-5 w-5 hover:text-gray-300" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
  <button
    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
    className="rounded-full bg-gray-800 text-sm w-8 h-8 flex items-center justify-center text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    aria-label="Toggle profile menu"
  >
    {/* Could be avatar or initial */}
    {user?.name?.[0] || "U"}
  </button>

  {isProfileMenuOpen && (
    <div
      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
      role="menu"
      aria-label="Profile menu"
    >
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  )}
</div>
</div>
)}
</div>
      </div>
    </nav>
  );
};

export default Navbar;
