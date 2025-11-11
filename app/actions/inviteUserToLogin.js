//app/actions/inviteUserToLogin

import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { addHours } from "date-fns";
import { validateEmail, validateName } from "@/lib/validation";

export async function inviteUserToLogin({ email, name, role }) {
  try {
    // ===== INPUT SANITIZATION & VALIDATION =====
    
    // Validate and sanitize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }
    const sanitizedEmail = emailValidation.sanitized;

    // Validate and sanitize name (optional)
    let sanitizedName = null;
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        throw new Error(nameValidation.error);
      }
      sanitizedName = nameValidation.sanitized;
    }

    // Validate role
    if (!role) throw new Error("Role is required");
    
    const validRoles = ["DRIVER", "MANAGER", "COORDINATOR", "ADMIN"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Check if user exists and has already set a password
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: { id: true, password: true },
    });

    if (existingUser?.password) {
      console.log("⚠️ User already has a password set:", sanitizedEmail);
      return { 
        success: false, 
        error: "User already has an active account. Use password reset instead." 
      };
    }

    // Upsert user with sanitized data
    const user = await prisma.user.upsert({
      where: { email: sanitizedEmail },
      update: { name: sanitizedName, role },
      create: { email: sanitizedEmail, name: sanitizedName, role },
    });

    console.log("📬 Sending direct invite to:", sanitizedEmail);

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

    // Prepare email content (use sanitized name)
    const appName = process.env.APP_NAME || "NEAT Taxi Booking App";
    const fromEmail = process.env.EMAIL_FROM || "noreply@example.com";
    const displayName = sanitizedName || "there";

    const mailOptions = {
      from: `"${appName}" <${fromEmail}>`,
      to: sanitizedEmail,
      subject: `Welcome to ${appName} - Set up your account`,
      text: `Hi ${displayName},\n\nYou've been invited to join ${appName} as a ${role}.\n\nClick the link below to set your password and get started:\n\n${onboardingUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't expect this invitation, please ignore this email.\n\nBest regards,\nThe ${appName} Team`,
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
              
              <p>Hi ${displayName},</p>
              
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
      message: `Invitation sent to ${sanitizedEmail}`,
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