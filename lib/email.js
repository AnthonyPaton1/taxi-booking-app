import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }) {
  try {
    // First try port 465 (secure)
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    return transporter.sendMail({
      from: `"NEAT App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.warn("465 failed, retrying with 587…", err.message);

    // Retry with port 587 (STARTTLS)
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    return transporter.sendMail({
      from: `"NEAT App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }
}