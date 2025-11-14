// app/actions/auth/registerAndInviteUser.js
"use server";

import { prisma } from "@/lib/db";
import { simpleRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { validatePhoneUK } from "@/lib/phoneValidation"; // ✅ Changed to validatePhoneUK
import { validateEmail, validateName, sanitizePlainText } from "@/lib/validation";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { addHours } from "date-fns";

async function getClientIpFromHeaders() {
  const headersList = await headers(); 
  
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || 'unknown';
}

export async function registerAndInviteUser(payload) {
  try {
    
    const ip = await getClientIpFromHeaders();
    const rateLimitResult = await simpleRateLimit(  
      `waitlist:${ip}`,
      RATE_LIMITS.auth.maxRequests,  
      RATE_LIMITS.auth.windowSeconds
    );

    // ✅ Defensive null check
    if (!rateLimitResult || !rateLimitResult.success) {
      const retryAfter = rateLimitResult?.retryAfter || 900;
      return {
        success: false,
        error: "Too many registration attempts. Please try again in 15 minutes.",
        retryAfter: retryAfter,
      };
    }

    const { name, email, phone, company, type, role, recaptchaToken } = payload;

    // VERIFY RECAPTCHA
    if (!recaptchaToken) {
      return {
        success: false,
        error: "Security verification failed. Please try again.",
      };
    }

    try {
      const recaptchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        }
      );

      const recaptchaData = await recaptchaResponse.json();

      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        console.warn('reCAPTCHA failed:', {
          success: recaptchaData.success,
          score: recaptchaData.score,
          action: recaptchaData.action,
        });
        return {
          success: false,
          error: "Security verification failed. Please try again or contact support.",
        };
      }

      console.log('✅ reCAPTCHA passed:', {
        score: recaptchaData.score,
        action: recaptchaData.action,
      });
    } catch (recaptchaError) {
      console.error('reCAPTCHA verification error:', recaptchaError);
    }

    // ===== INPUT SANITIZATION & VALIDATION =====
    
    // Validate required fields first
    if (!name || !email || !phone || !company || !type || !role) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    // Validate and sanitize name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return {
        success: false,
        error: nameValidation.error,
      };
    }
    const sanitizedName = nameValidation.sanitized;

    // Validate and sanitize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return {
        success: false,
        error: emailValidation.error,
      };
    }
    const sanitizedEmail = emailValidation.sanitized;

    // ✅ VALIDATE PHONE - Using validatePhoneUK with correct properties
    const phoneValidation = validatePhoneUK(phone);
    if (!phoneValidation.valid) {
      return {
        success: false,
        error: phoneValidation.message || "Invalid UK phone number",
      };
    }
    const sanitizedPhone = phoneValidation.formatted;

    // Sanitize company name
    const sanitizedCompany = sanitizePlainText(company).substring(0, 200);
    if (sanitizedCompany.length < 2) {
      return {
        success: false,
        error: "Company name must be at least 2 characters",
      };
    }

    // Validate type
    const validTypes = ['CARE', 'TAXI'];
    if (!validTypes.includes(type)) {
      return {
        success: false,
        error: "Invalid business type",
      };
    }

    // Validate role
    const validRoles = ["DRIVER", "ADMIN", "COORDINATOR"];
    if (!validRoles.includes(role)) {
      return {
        success: false,
        error: "Invalid role",
      };
    }

    // Check for duplicate email (using sanitized email)
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        code: "DUPLICATE_EMAIL",
        error: "This email is already registered. Please use a different email or contact support.",
      };
    }

    // Create user with sanitized data
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        role,
      },
    });

    // Create business if ADMIN/COORDINATOR (using sanitized company name)
    if (role === "ADMIN" || role === "COORDINATOR") {
      await prisma.business.create({
        data: {
          name: sanitizedCompany,
          type,
          adminUserId: user.id,
        },
      });
    }

    // ✅ SEND INVITATION EMAIL
    try {
      // Delete any existing tokens
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Generate token
      const token = nanoid(24);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: addHours(new Date(), 24),
        },
      });

      // Setup email (using sanitized name and email)
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const setPasswordUrl = `${baseUrl}/set-password?token=${token}`;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"NEAT Transport" <${process.env.SMTP_USER}>`,
        to: sanitizedEmail,
        subject: 'Welcome to NEAT Transport - Set Your Password',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #0070f3;">Welcome to NEAT Transport, ${sanitizedName}!</h1>
                <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
                <p>Click the button below to set your password and get started:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${setPasswordUrl}" 
                     style="display: inline-block; padding: 14px 28px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Set Your Password
                  </a>
                </div>
                <p style="font-size: 14px; color: #666;">
                  Or copy and paste this link:<br/>
                  <a href="${setPasswordUrl}" style="color: #0070f3;">${setPasswordUrl}</a>
                </p>
                <p style="font-size: 12px; color: #999; margin-top: 30px;">
                  This link expires in 24 hours. If you didn't request this, please ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
      });

      console.log("✅ Email sent to:", sanitizedEmail);

    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError);
      // Don't fail the registration if email fails
      // User is created, we can resend the email later
    }

    console.log("✅ User registered:", {
      id: user.id,
      email: user.email,
      role: user.role,
      company: sanitizedCompany,
    });

    return {
      success: true,
      message: "Registration successful! Check your email to set your password.",
      userId: user.id,
    };

  } catch (error) {
    console.error("❌ Registration error:", error);
    return {
      success: false,
      error: "Failed to register. Please try again later.",
    };
  }
}