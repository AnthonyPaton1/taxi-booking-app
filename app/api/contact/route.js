// app/api/contact/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit";
import { validateEmail, validateName, validateTextArea, sanitizePlainText } from "@/lib/validation";

export async function POST(request) {
  try {
    // ✅ RATE LIMITING
    const ip = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `contact:${ip}`,
      RATE_LIMITS.CONTACT.limit,
      RATE_LIMITS.CONTACT.window
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Too many contact submissions. Please try again later.",
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMITS.CONTACT.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          }
        }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, category, message } = body;

    // ===== INPUT SANITIZATION & VALIDATION =====
    
    // Validate and sanitize name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }
    const sanitizedName = nameValidation.sanitized;

    // Validate and sanitize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }
    const sanitizedEmail = emailValidation.sanitized;

    // Sanitize phone (optional)
    const sanitizedPhone = phone ? sanitizePlainText(phone).substring(0, 20) : null;

    // Sanitize subject
    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: "Subject must be at least 3 characters" }, { status: 400 });
    }
    const sanitizedSubject = sanitizePlainText(subject).substring(0, 200);

    // Validate category
    const validCategories = ['GENERAL', 'SUPPORT', 'FEEDBACK', 'BUG', 'OTHER'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Validate and sanitize message
    const messageValidation = validateTextArea(message, 10, 2000);
    if (!messageValidation.valid) {
      return NextResponse.json({ error: messageValidation.error }, { status: 400 });
    }
    const sanitizedMessage = messageValidation.sanitized;

    // Store contact request in database with sanitized data
    const contactRequest = await prisma.feedback.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        subject: sanitizedSubject,
        category,
        message: sanitizedMessage,
        status: "NEW",
      },
    });

    console.log("📧 Contact form submission:", {
      id: contactRequest.id,
      name: sanitizedName,
      email: sanitizedEmail,
      category,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Contact request received successfully" 
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.CONTACT.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        }
      }
    );
  } catch (error) {
    console.error("❌ Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process contact request" },
      { status: 500 }
    );
  }
}

// GET route to retrieve contact requests (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contacts = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error("❌ Error retrieving contacts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve contacts" },
      { status: 500 }
    );
  }
}