// app/actions/auth/registerAndInviteUser.js
"use server";

import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function registerAndInviteUser(formData) {
  const { name, email, type, phone } = formData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "User with this email already exists." };
  }

  // Create user immediately
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      role: type, // ADMIN or DRIVER from form
      isApproved: true,
    },
  });

  // Create reset token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const resetLink = `${process.env.NEXTAUTH_URL}/set-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Set up your account password",
    html: `
      <p>Hello ${name || ""},</p>
      <p>Thank you for registering. Click below to set your password and access your account:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
  });

  return { success: true };
}