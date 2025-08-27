// app/actions/sendContactEmail.js
"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail({ name, email, message }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Waitlist Contact" <${process.env.CONTACT_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Waitlist Contact from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return {
      success: false,
      error: "Failed to send message. Please try again later.",
    };
  }
}
