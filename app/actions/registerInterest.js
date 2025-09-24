// app/actions/registerInterest.js (or similar)

import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function registerInterest(formData) {
  const { name, email, phone, companyName, message, type } = formData;
  console.log("Register interest called with:", formData);

  // 👇 Assign the role based on the "type" selected
  const role = type === "BUSINESS" ? Role.ADMIN : Role.DRIVER;

  // Save to DB
  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      companyName,
      message,
      role,          // ✅ Set role here!
      isApproved: false,
      password: null,
      driverOnboarded: false,
      managerOnboarded: false,
      // You might also store the original type if needed
    },
  });

  // Optional: send confirmation email

  return { success: true, user };
}