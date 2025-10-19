// export async function inviteUserToLogin({ email, name, role }) {
//   try {
//     if (!email) throw new Error("Email is required");

//     const user = await prisma.user.upsert({
//       where: { email },
//       update: { name, role },
//       create: { email, name, role },
//     });
    
//     console.log("Sending invite to:", email);
//     console.log("Callback URL:", `${process.env.NEXTAUTH_URL}/set-password`);

//     const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/signin/email`, {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         callbackUrl: `${process.env.NEXTAUTH_URL}/set-password`,
//         email,
//       }),
//     });

//     console.log("Email API response status:", response.status);
//     const responseText = await response.text();
//     console.log("Email API response:", responseText);

//     if (!response.ok) {
//       throw new Error(`Email API failed: ${responseText}`);
//     }

//     return { success: true, message: `Invite sent to ${email}` };
//   } catch (err) {
//     console.error("Invite failed:", err);
//     return { success: false, error: err.message };
//   }

import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { addHours } from "date-fns";

export async function inviteUserToLogin({ email, name, role }) {
  try {
    // Validate required fields
    if (!email) throw new Error("Email is required");
    if (!role) throw new Error("Role is required");
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate role is one of the expected values
    const validRoles = ["DRIVER", "MANAGER", "COORDINATOR", "ADMIN"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Check if user exists and has already set a password
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (existingUser?.password) {
      console.log("⚠️ User already has a password set:", email);
      return { 
        success: false, 
        error: "User already has an active account. Use password reset instead." 
      };
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: { email, name, role },
    });

    console.log("📬 Sending direct invite to:", email);

    // Delete any existing tokens for this user to prevent token reuse
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate and store password setup token (24 chars for better security)
    const token = nanoid(24);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: addHours(new Date(), 24), // expires in 24 hours
      },
    });

    // Construct onboarding URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const onboardingUrl = `${baseUrl}/set-password?token=${token}`;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT || "2525"),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("❌ Email transporter verification failed:", verifyError);
      throw new Error("Email service configuration error");
    }

    // Prepare email content
    const appName = process.env.APP_NAME || "NEAT Taxi Booking App";
    const fromEmail = process.env.EMAIL_FROM || "noreply@example.com";

    const mailOptions = {
      from: `"${appName}" <${fromEmail}>`,
      to: email,
      subject: `Welcome to ${appName} - Set up your account`,
      text: `Hi ${name || "there"},\n\nYou've been invited to join ${appName} as a ${role}.\n\nClick the link below to set your password and get started:\n\n${onboardingUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't expect this invitation, please ignore this email.\n\nBest regards,\nThe ${appName} Team`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
              <h1 style="color: #0070f3; margin-top: 0;">Welcome to ${appName}!</h1>
              
              <p>Hi ${name || "there"},</p>
              
              <p>You've been invited to join <strong>${appName}</strong> as a <strong>${role}</strong>.</p>
              
              <p>To get started, please set your password by clicking the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${onboardingUrl}" 
                   style="display: inline-block; padding: 14px 28px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Set Your Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this URL into your browser:<br/>
                <a href="${onboardingUrl}" style="color: #0070f3; word-break: break-all;">${onboardingUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999;">
                This link will expire in 24 hours. If you didn't expect this invitation, please ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully:", info.messageId);

    return { 
      success: true, 
      message: `Invitation sent to ${email}`,
      userId: user.id 
    };
    
  } catch (err) {
    console.error("❌ Invite failed:", err);
    
    // Provide more specific error messages
    if (err.message.includes("ECONNREFUSED")) {
      return { success: false, error: "Email service unavailable. Please try again later." };
    }
    
    if (err.message.includes("Invalid login")) {
      return { success: false, error: "Email service authentication failed." };
    }
    
    return { 
      success: false, 
      error: err.message || "Failed to send invitation" 
    };
  }
}