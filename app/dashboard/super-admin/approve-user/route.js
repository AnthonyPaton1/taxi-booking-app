import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    return NextResponse.json({ message: "User approved", user: updated }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}