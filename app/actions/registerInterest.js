// app/actions/registerInterest.js 

import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function registerInterest(formData) {
  const { name, email, phone, businessName, message, type } = formData;
  

  // 👇 Assign the role based on the "type" selected
  const role = type === "CARE" ? Role.ADMIN : Role.DRIVER;

  // Save to DB
  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      businessName,
      message,
      role,          
      isApproved: false,
      password: null,
      driverOnboarded: false,
      managerOnboarded: false,
      
    },
  });

  return { success: true, user };
}