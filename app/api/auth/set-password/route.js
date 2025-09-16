// app/api/auth/set-password/route.js
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { token, password } = await req.json();

  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!reset || reset.expiresAt < new Date()) {
    return Response.json({ message: "Invalid or expired token" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: reset.userId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.delete({ where: { id: reset.id } });

  return Response.json({ message: "Password set successfully. You can now log in." });
}