// app/actions/auth/registerAndInviteUser.js
"use server";

import { prisma } from "@/lib/db";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateUKPhone } from "@/lib/phoneValidation";
import { headers } from "next/headers";

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
    // ✅ RATE LIMITING
    const ip = await getClientIpFromHeaders(); 
    const rateLimitResult = await rateLimit(
      `waitlist:${ip}`,
      RATE_LIMITS.AUTH.limit,
      RATE_LIMITS.AUTH.window
    );

    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Too many registration attempts. Please try again in 15 minutes.",
        retryAfter: rateLimitResult.retryAfter,
      };
    }

    const { name, email, phone, company, type, role, recaptchaToken } = payload;

    // ✅ VERIFY RECAPTCHA
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

      // Check if verification passed and score is acceptable (0.5 threshold)
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
      // Fail open in case of reCAPTCHA service issues
    }

    // Validate required fields
    if (!name || !email || !phone || !company || !type || !role) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    // ✅ PHONE VALIDATION
    const phoneValidation = validateUKPhone(phone);
    if (!phoneValidation.isValid) {
      return {
        success: false,
        error: phoneValidation.error || "Invalid UK phone number",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Invalid email format",
      };
    }

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        code: "DUPLICATE_EMAIL",
        error: "This email is already registered. Please use a different email or contact support.",
      };
    }

    // Create user with pending status
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phoneValidation.formatted, // Use formatted phone number
        role,
        // Don't set password yet - they'll set it via email link
      },
    });

    // Create business if ADMIN/COORDINATOR
    if (role === "ADMIN" || role === "COORDINATOR") {
      await prisma.business.create({
        data: {
          name: company,
          type,
          adminId: user.id,
        },
      });
    }

    // TODO: Send invitation email with set-password link
    // Generate token and send email here

    console.log("✅ User registered:", {
      id: user.id,
      email: user.email,
      role: user.role,
      company,
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