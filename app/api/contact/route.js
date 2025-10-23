import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
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

    // Store contact request in database (optional)
    // Uncomment to save contact requests to DB
    /*
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        category,
        message,
        status: "NEW",
        createdAt: new Date(),
      },
    });
    */

    // TODO: Send email notification
    // You'll want to integrate with a service like:
    // - Resend (resend.com) - Modern, developer-friendly
    // - SendGrid
    // - AWS SES
    // - Postmark
    
    // Example with Resend (you'd need to install: npm install resend)
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'NEAT Transport <noreply@neattransport.co.uk>',
      to: 'support@neattransport.co.uk',
      replyTo: email,
      subject: `[${category.toUpperCase()}] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    */

    // For now, just log it (remove in production)
    console.log("📧 Contact form submission:", {
      name,
      email,
      phone,
      category,
      subject,
      messagePreview: message.substring(0, 50) + "...",
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Contact request received successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process contact request" },
      { status: 500 }
    );
  }
}

// Optional: GET route to retrieve contact requests (admin only)
export async function GET(request) {
  try {
    // TODO: Add authentication check here
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Uncomment if you're storing in DB
    /*
    const contacts = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 most recent
    });

    return NextResponse.json({ contacts }, { status: 200 });
    */

    return NextResponse.json(
      { message: "Contact retrieval not yet implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("❌ Error retrieving contacts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve contacts" },
      { status: 500 }
    );
  }
}