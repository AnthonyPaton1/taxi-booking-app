"use server";

import { prisma } from "@/lib/db";

export async function inviteUserToLogin({ email, name, role }) {
  try {
    if (!email) throw new Error("Email is required");

    // 1. Create or update user with role
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: { email, name, role },
    });

  await fetch(`${process.env.NEXTAUTH_URL}/api/auth/signin/email`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    callbackUrl: `${process.env.NEXTAUTH_URL}/set-password`,
    email,
  }),
});

    return { success: true, message: `Invite sent to ${email}` };
  } catch (err) {
    console.error("Invite failed:", err);
    return { success: false, error: err.message };
  }
}