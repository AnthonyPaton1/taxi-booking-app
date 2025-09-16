import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, phone, password, type } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Assign role based on `type` (business/driver)
    let role = "DRIVER";
    if (type === "business") role = "COMPANY_ADMIN";

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashed,
        role,
        isApproved: false, // stays false until admin approves
      },
    });

    // (Optional) Notify admin by email
    console.log(`New ${role} registration: ${email}`);

    return NextResponse.json(
      { message: "Registration successful. Pending admin approval.", userId: newUser.id },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}