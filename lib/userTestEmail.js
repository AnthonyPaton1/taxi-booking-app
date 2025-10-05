// lib/userTestEmail.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendTestUserInviteEmail({ to, name, role }) {
  try {
    const mailOptions = {
      from: '"NEAT App" <no-reply@accesscare.dev>', // dev identity
      to,
      subject: `You're invited to join as a ${role}`,
      html: `
        <p>Hi ${name || "there"},</p>
        <p>You've been invited to join NEAT as a <strong>${role}</strong>.</p>
        <p>Please click the button below to set up your account:</p>
        <p><a href="https://your-app-url.com/onboarding/login" style="background-color:#1D4ED8;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Accept Invitation</a></p>
        <p>If you did not expect this email, you can ignore it.</p>
        <br />
        <p>– The NEAT Team</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Test invite email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send invite email:", error);
    return { success: false, error: error.message };
  }
}