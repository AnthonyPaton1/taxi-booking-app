"use client";

import React from "react";
import Link from "next/link";

const steps = [
  { name: "Main Dashboard", href: "/dashboard/super-admin/mainPage" },
  { name: "Manage Drivers", href: "/dashboard/super-admin/manage-drivers" },
  { name: "Manage Businesses", href: "/dashboard/super-admin/manage-businesses" },
  { name: "Approve Users", href: "/dashboard/super-admin/approve-user" },
  { name: "Revenue", href: "/dashboard/super-admin/revenue" },
];

const CheckoutSteps = ({ current = 0 }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
      {steps.map(({ name, href }, index) => (
        <React.Fragment key={name}>
          <Link href={href}>
            <div
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap cursor-pointer transition
                ${
                  index === current
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
            >
              {name}
            </div>
          </Link>
          {index < steps.length - 1 && (
            <span className="text-gray-400 text-lg">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
export default CheckoutSteps;