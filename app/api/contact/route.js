// app/api/contact/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

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

    // Validation
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Store contact request in database
    const contactRequest = await prisma.feedback.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        category,
        message,
        status: "NEW",
      },
    });

    console.log("📧 Contact form submission:", {
      id: contactRequest.id,
      name,
      email,
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