// actions/approveUser.js
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email"; // we’ll build this helper

export async function approveUser(registrationId) {
  const registration = await prisma.registrationRequest.findUnique({
    where: { id: registrationId },
  });

  if (!registration) throw new Error("Registration not found");

  // create user
  const user = await prisma.user.create({
    data: {
      email: registration.email,
      name: registration.name,
      role: registration.role, // DRIVER or BUSINESS
      isApproved: true,
    },
  });

  // create reset token (valid for 24h)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // build link
  const resetLink = `${process.env.NEXTAUTH_URL}/set-password?token=${token}`;

  // send email
  await sendEmail({
    to: user.email,
    subject: "Set up your account password",
    html: `<p>Hello ${user.name || ""},</p>
           <p>Your account has been approved. Click below to set your password:</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>This link will expire in 24 hours.</p>`,
  });

  return user;
}