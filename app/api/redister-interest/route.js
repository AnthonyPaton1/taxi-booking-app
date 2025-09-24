import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { name, email, phone, type } = await req.json();

    // Save request
    const request = await prisma.registerInterest.create({
      data: { name, email, phone, type },
    });

    // Notify admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Registration Request",
      html: `
        <p><b>${type}</b> registration request from ${name}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
        <p>Login to dashboard to approve.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to register" }), { status: 500 });
  }
}