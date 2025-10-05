// app/api/invite-manager/route.js
import { NextResponse } from "next/server";
import { sendTestUserInviteEmail } from "@/lib/userTestEmail";

export async function POST(req) {
  try {
    const body = await req.json();

    // You can validate this further with zod if needed
    const { managers } = body;

    if (!managers || !Array.isArray(managers)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Send emails to each manager
    for (const manager of managers) {
      await sendTestUserInviteEmail({
        to: manager.email,
        name: manager.name,
        role: "MANAGER",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to send invites:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}