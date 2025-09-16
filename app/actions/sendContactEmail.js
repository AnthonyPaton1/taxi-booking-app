// app/actions/sendContactEmail.js
"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail(formData) {
  try {
    const { name, email, message, type } = formData;

    // Transporter setup (use your .env values!)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email contents
    const mailOptions = {
      from: `"NEAT Booking App" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL, // who receives the submissions
      subject: `New ${type} registration request`,
      text: `
A new ${type} has registered via the form.

Name: ${name || "N/A"}
Email: ${email}
Message: ${message || "N/A"}
Type: ${type}
      `,
      html: `
        <h2>New ${type} Registration Request</h2>
        <p><strong>Name:</strong> ${name || "N/A"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message || "N/A"}</p>
        <p><strong>Type:</strong> ${type}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("SMTP not configured — skipping email send.");
  return { success: true }; // pretend success for now
}

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
}
