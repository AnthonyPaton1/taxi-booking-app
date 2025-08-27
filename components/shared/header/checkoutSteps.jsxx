"use client";

import React from "react";
import Link from "next/link";

const steps = [
  { name: "SignUp Form", href: "/dashboard/admin/onboarding" },
  { name: "Edit details", href: "/dashboard/admin/edit" },
  { name: "Audit view", href: "/dashboard/admin/audit" },
  { name: "Notifications", href: "/dashboard/admin/notifications" },
];

const CheckoutSteps = ({ current = 0 }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-10">
      {steps.map(({ name, href }, index) => (
        <React.Fragment key={name}>
          <Link href={href}>
            <div
              className={`p-2 w-56 rounded-full text-center text-sm cursor-pointer transition
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
            <hr className="w-4 border-t border-gray-300 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
