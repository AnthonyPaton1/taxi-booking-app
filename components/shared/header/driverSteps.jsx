"use client";

import React from "react";
import Link from "next/link";

const steps = [
  { name: "Driver Dashboard", href: "/dashboard/driver" },
  { name: "Daily Job Sheet", href: "/dashboard/driver/daily" },
  { name: "Advanced Job Sheet", href: "/dashboard/driver/advanced" },
  { name: "Notifications", href: "/dashboard/driver/notifications" },
  { name: "Messages", href: "/dashboard/driver/messages" }, 
  { name: "Invoices & Earnings", href: "/dashboard/driver/invoices" },
  { name: "Ratings & Feedback", href: "/dashboard/driver/feedback" }, 
  { name: "Edit details", href: "/dashboard/driver/edit" },
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