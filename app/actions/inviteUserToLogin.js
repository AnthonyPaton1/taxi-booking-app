"use server";

import { prisma } from "@/lib/db";
import { sendVerificationRequest } from "next-auth/providers/email";

export async function inviteUserToLogin({ email, name, role }) {
  try {
    if (!email) throw new Error("Email is required");

    // 1. Create or update user with role
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: { email, name, role },
    });

    // 2. Send login email
    await sendVerificationRequest({
      identifier: email,
      url: `${process.env.NEXTAUTH_URL}/api/auth/callback/email?email=${email}`,
      provider: {
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      },
    });

    return { success: true, message: `Invite sent to ${email}` };
  } catch (err) {
    console.error("Invite failed:", err);
    return { success: false, error: err.message };
  }
}