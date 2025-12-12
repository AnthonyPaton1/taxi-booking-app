"use server";

import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

export async function sendContactEmail(formData) {
  try {
    const { name, email, phone, message, type } = formData;

    // Save to DB using your correct model name
    await prisma.registerInterest.create({
      data: {
        name,
        email,
        phone,
        type,
        message,
      },
    });
    
    // Send notification email to admin
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"NEAT Booking App" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New ${type} registration request`,
      text: `
A new ${type} has registered.

Name: ${name || "N/A"}
Email: ${email}
Phone: ${phone || "N/A"}
Message: ${message || "N/A"}
Type: ${type}
      `,
      html: `
        <h2>New ${type} Registration Request</h2>
        <p><strong>Name:</strong> ${name || "N/A"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong> ${message || "N/A"}</p>
        <p><strong>Type:</strong> ${type}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error: error.message };
  }
}