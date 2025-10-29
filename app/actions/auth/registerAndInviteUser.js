// app/actions/auth/registerAndInviteUser.js
"use server";

import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function registerAndInviteUser(formData) {
  try {
    const { name, email, role, phone } = formData;

    // Validate required fields
    if (!email || !name || !role) {
      return { 
        success: false, 
        error: "Missing required fields. Please provide name, email, and role." 
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { 
        success: false, 
        error: "A user with this email address already exists. Please use a different email or contact support if you need help accessing your account.",
        code: "DUPLICATE_EMAIL"
      };
    }

    // Create user immediately
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        isApproved: true,
      },
    });

    // Create reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/set-password?token=${token}`;

    // Send email
    await sendEmail({
      to: email,
      subject: "Welcome to NEAT - Set up your account password",
      html: `
        <h2>Welcome to NEAT, ${name}!</h2>
        <p>Your account has been created successfully. Click the button below to set your password and get started:</p>
        <p style="margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Set Your Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${resetLink}</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">This link will expire in 24 hours for security reasons.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this account, please ignore this email.</p>
      `,
    });

    return { 
      success: true,
      message: `Invitation sent successfully to ${email}. They'll receive an email with instructions to set their password.`
    };

  } catch (error) {
    console.error("Error in registerAndInviteUser:", error);
    
    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return { 
        success: false, 
        error: "A user with this email already exists.",
        code: "DUPLICATE_EMAIL"
      };
    }

    // Generic error
    return { 
      success: false, 
      error: "Something went wrong while creating the user. Please try again or contact support if the problem persists.",
      code: "SERVER_ERROR"
    };
  }
}