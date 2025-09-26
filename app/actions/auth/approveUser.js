// actions/approveUser.js
"use server";
import  {prisma} from "@/lib/db";
import crypto from "crypto";
import { sendEmail } from "@/lib/email"; 

export async function approveUser(registrationId) {
  console.log("✅ approveUser called with ID:", registrationId);
const registration = await prisma.registerInterest.findUnique({
  where: { id: registrationId },
});

  if (!registration) throw new Error("Registration not found");

  // Check if user already exists
const existingUser = await prisma.user.findUnique({
  where: { email: registration.email },
});

if (existingUser) {
  throw new Error("User with this email already exists.");
}

  // create user
  const user = await prisma.user.create({
    data: {
      email: registration.email,
      name: registration.name,
      role: registration.type === "TAXI" ? "DRIVER" : "ADMIN",
      isApproved: true,
    },
  });

  // create reset token (valid for 24h)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.PasswordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // build link
  const resetLink = `${process.env.NEXTAUTH_URL}/set-password?token=${token}`;

console.log("✅ Created user:", user.email);
console.log("✅ Created token:", token);
console.log("✅ Sent reset link:", resetLink);

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