// /app/api/enquiry/route.js (or /api/enquiry.js depending on routing)

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
  const body = await req.json();

  const { name, email, phone, companyName, message, type } = body;

  try {
    // Save to DB
    const newLead = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone,
        companyName,
        message,
        type, // e.g., "TAXI" or "BUSINESS"
      },
    });

    // Notify admin via email
    await sendEmail({
      to: "admin@yourdomain.com",
      subject: "New NEAT Enquiry Submitted",
      html: `
        <h3>New enquiry received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Failed to submit enquiry:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}