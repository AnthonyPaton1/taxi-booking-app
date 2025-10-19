// app/api/invite/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email, name, role } = await req.json();

    if (!email) throw new Error("Email is required");

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: { email, name, role },
    });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    // Generate magic link (you'll need to create a verification token)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const magicLink = `${process.env.NEXTAUTH_URL}/set-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "You've been invited to join",
      html: `
        <h1>Welcome ${name}!</h1>
        <p>You've been invited to join as a ${role}.</p>
        <p><a href="${magicLink}">Click here to set your password</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Invite sent to ${email}` 
    });
  } catch (err) {
    console.error("Invite failed:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}