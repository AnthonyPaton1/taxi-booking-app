// app/api/auth/set-password/route.js
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { token, password } = await req.json();

  const reset = await prisma.PasswordResetToken.findUnique({
    where: { token },
  });

  if (!reset || reset.expiresAt < new Date()) {
    return Response.json(
      { message: "Invalid or expired token" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: reset.userId },
    data: { password: hashed },
  });

  const user = await prisma.user.findUnique({
    where: { id: reset.userId },
    select: { email: true, role: true },
  });

  if (!user?.email || !user?.role) {
    return Response.json(
      { message: "User not found after password reset." },
      { status: 500 }
    );
  }

  await prisma.PasswordResetToken.delete({ where: { id: reset.id } });

  return Response.json({
    message: "Password set successfully.",
    email: user.email,
    role: user.role,
  });
}