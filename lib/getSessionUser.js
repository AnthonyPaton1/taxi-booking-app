// lib/getSessionUser.js
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return null; // Don't throw — just return null
  }

  return session.user;
}