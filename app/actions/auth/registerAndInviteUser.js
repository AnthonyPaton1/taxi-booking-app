// app/actions/auth/registerAndInviteUser.js
"use server";

import { prisma } from "@/lib/db";
import { simpleRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { validatePhoneUK } from "@/lib/phoneValidation";
import { validateEmail, validateName, sanitizePlainText } from "@/lib/validation";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email"; // ✅ Use centralized email function
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
    
    if (!name || !email || !phone || !company || !type || !role) {
      return {
        success: false,
        error: "All fields are required",
      };
    }

    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return {
        success: false,
        error: nameValidation.error,
      };
    }
    const sanitizedName = nameValidation.sanitized;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return {
        success: false,
        error: emailValidation.error,
      };
    }
    const sanitizedEmail = emailValidation.sanitized;

    const phoneValidation = validatePhoneUK(phone);
    if (!phoneValidation.valid) {
      return {
        success: false,
        error: phoneValidation.message || "Invalid UK phone number",
      };
    }
    const sanitizedPhone = phoneValidation.formatted;

    const sanitizedCompany = sanitizePlainText(company).substring(0, 200);
    if (sanitizedCompany.length < 2) {
      return {
        success: false,
        error: "Company name must be at least 2 characters",
      };
    }

    const validTypes = ['CARE', 'TAXI'];
    if (!validTypes.includes(type)) {
      return {
        success: false,
        error: "Invalid business type",
      };
    }

    const validRoles = ["DRIVER", "ADMIN", "COORDINATOR"];
    if (!validRoles.includes(role)) {
      return {
        success: false,
        error: "Invalid role",
      };
    }

    // Check for duplicate email
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

    // ✅ CHECK IF SUPER ADMIN EMAIL
    const superAdminEmails = process.env.SUPER_ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
    const isSuperAdmin = superAdminEmails.includes(sanitizedEmail);

    // Create user with sanitized data
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        role: isSuperAdmin ? 'SUPER_ADMIN' : role, // ✅ Auto-promote super admin
        isApproved: isSuperAdmin ? true : undefined, // ✅ Auto-approve super admin
        emailVerified: isSuperAdmin ? new Date() : undefined, // ✅ Auto-verify super admin
        driverOnboarded: isSuperAdmin ? true : undefined,
        adminOnboarded: isSuperAdmin ? true : undefined,
      },
    });

    // Create business if ADMIN/COORDINATOR (not for super admin)
    if (!isSuperAdmin && (role === "ADMIN" || role === "COORDINATOR")) {
      await prisma.business.create({
        data: {
          name: sanitizedCompany,
          type,
          adminUserId: user.id,
        },
      });
    }

    // ✅ SEND INVITATION EMAIL using centralized function
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

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
      const setPasswordUrl = `${baseUrl}/set-password?token=${token}`;

      // ✅ Use centralized email function with proper IONOS config
      await sendEmail({
        to: sanitizedEmail,
        subject: 'Welcome to NEAT Transport - Set Your Password',
        text: `Welcome to NEAT Transport, ${sanitizedName}! Set your password here: ${setPasswordUrl}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">NEAT Transport</h1>
                        <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Accessible Transport Marketplace</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${sanitizedName}!</h2>
                        
                        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                          Your account has been created successfully as a <strong>${isSuperAdmin ? 'Super Admin' : role}</strong>.
                        </p>
                        
                        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          Click the button below to set your password and get started:
                        </p>
                        
                        <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td style="background-color: #667eea; border-radius: 6px; text-align: center;">
                              <a href="${setPasswordUrl}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                Set Your Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="color: #667eea; font-size: 14px; word-break: break-all;">
                          ${setPasswordUrl}
                        </p>
                        
                        <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0;">
                          This link will expire in 24 hours. If you didn't request this, please ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef; text-align: center;">
                        <p style="color: #6c757d; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} NEAT Transport. All rights reserved.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      console.log("✅ Email sent to:", sanitizedEmail);

    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError);
      // Don't fail the registration if email fails
    }

    console.log("✅ User registered:", {
      id: user.id,
      email: user.email,
      role: user.role,
      company: sanitizedCompany,
      isSuperAdmin
    });

    return {
      success: true,
      message: `Registration successful! ${isSuperAdmin ? 'Super admin account created.' : 'Check your email to set your password.'}`,
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