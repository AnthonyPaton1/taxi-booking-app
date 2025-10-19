import nodemailer from "nodemailer";

async function main() {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: "7f1e8d38210ea5",
      pass: "5403092327e115",
    },
  });

  const info = await transporter.sendMail({
    from: '"Your App" <no-reply@example.com>',
    to: "testuser@example.com",
    subject: "Mailtrap Test Email",
    text: "Hello! This is a test email from Mailtrap.",
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);