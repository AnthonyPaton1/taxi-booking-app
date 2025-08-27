// components/layout/Navbar.jsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, getProviders } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

const Navbar = ({ session }) => {
  const [providers, setProviders] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileImage = session?.user?.image;

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  return (
    <nav
      className="bg-blue-700 border-b border-blue-500"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center text-white font-semibold text-lg"
          >
            NEAT Booking App
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {!session && providers && (
              <button
                onClick={() => signIn("google")}
                className="flex items-center text-white bg-gray-700 hover:bg-gray-900 rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <FaGoogle className="mr-2" />
                <span>Login</span>
              </button>
            )}

            {session && (
              <>
                {/* Messages */}
                <Link href="/messages" className="relative">
                  <button
                    type="button"
                    className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white"
                  >
                    <span className="sr-only">View notifications</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>
                  </button>
                  <UnreadMessageCount />
                </Link>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="rounded-full bg-gray-800 text-sm focus:outline-none"
                  >
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={profileImage || profileDefault}
                      width={40}
                      height={40}
                      alt="User profile"
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Optional: Clean mobile login toggle */}
      {isMobileMenuOpen && !session && (
        <div className="md:hidden px-4 pb-4">
          <button
            onClick={() => signIn("google")}
            className="flex items-center text-white bg-gray-700 hover:bg-gray-900 rounded-md px-3 py-2 w-full justify-center"
          >
            <FaGoogle className="mr-2" />
            <span>Login</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
