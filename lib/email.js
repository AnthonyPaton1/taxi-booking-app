// lib/email.js - EXTENDED VERSION
import nodemailer from "nodemailer";

// Your existing sendEmail function (keep this!)
export async function sendEmail({ to, subject, html }) {
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
      from: `"NEAT Transport" <${process.env.SMTP_USER}>`,
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
      from: `"NEAT Transport" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }
}

// ============================================
// NEW: Specific email functions
// ============================================

// Contact form email
export async function sendContactFormEmail({ name, email, phone, subject, category, message }) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>From:</strong> ${name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Category:</strong> <span style="background: #dbeafe; padding: 2px 8px; border-radius: 4px;">${category}</span></p>
        <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
      </div>
      
      <div style="background: white; padding: 20px; border-left: 4px solid #1e40af; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
        Sent from NEAT Transport contact form at ${new Date().toLocaleString('en-GB', {
          dateStyle: 'full',
          timeStyle: 'short'
        })}
      </p>
    </div>
  `;

  return sendEmail({
    to: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
    subject: `[${category.toUpperCase()}] ${subject}`,
    html,
  });
}

// Booking confirmation email
export async function sendBookingConfirmation({ 
  to, 
  bookingId, 
  pickupLocation, 
  dropoffLocation, 
  pickupDate, 
  pickupTime,
  passengerCount,
  wheelchairUsers 
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">✅ Booking Confirmed</h2>
      
      <p>Your transport booking has been confirmed.</p>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Date:</strong> ${pickupDate}</p>
        <p><strong>Time:</strong> ${pickupTime}</p>
        <p><strong>From:</strong> ${pickupLocation}</p>
        <p><strong>To:</strong> ${dropoffLocation}</p>
        <p><strong>Passengers:</strong> ${passengerCount}</p>
        ${wheelchairUsers > 0 ? `<p><strong>Wheelchair Users:</strong> ${wheelchairUsers}</p>` : ''}
      </div>
      
      <p>You will receive another email when a driver accepts your booking.</p>
      
      <p style="color: #6b7280; font-size: 12px;">
        Need to make changes? <a href="https://neattransport.co.uk/dashboard">Log in to your dashboard</a>
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Booking Confirmed - ${bookingId}`,
    html,
  });
}

// Driver acceptance notification
export async function sendDriverAcceptanceEmail({ 
  to, 
  bookingId, 
  driverName, 
  driverPhone, 
  vehicleReg,
  pickupTime 
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🚗 Driver Assigned</h2>
      
      <p>Great news! A driver has accepted your booking.</p>
      
      <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Driver Details</h3>
        <p><strong>Driver:</strong> ${driverName}</p>
        <p><strong>Phone:</strong> <a href="tel:${driverPhone}">${driverPhone}</a></p>
        <p><strong>Vehicle Registration:</strong> ${vehicleReg}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>⏰ Reminder:</strong> Your pickup is at ${pickupTime}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px;">The driver will call you 10 minutes before arrival.</p>
      </div>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
        Booking ID: ${bookingId}
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Driver Assigned - Booking ${bookingId}`,
    html,
  });
}

// Password reset email
export async function sendPasswordResetEmail({ to, resetToken, userName }) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">🔐 Password Reset Request</h2>
      
      <p>Hi ${userName},</p>
      
      <p>We received a request to reset your password for your NEAT Transport account.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      
      <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 20px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;">
          <strong>⚠️ Security Notice:</strong><br>
          This link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Password Reset Request - NEAT Transport',
    html,
  });
}

// Incident report notification (to admin/coordinator)
export async function sendIncidentReportEmail({ 
  to, 
  incidentId, 
  reportedBy, 
  bookingId, 
  incidentType, 
  description 
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444; border-bottom: 3px solid #ef4444; padding-bottom: 10px;">
        ⚠️ Incident Report Submitted
      </h2>
      
      <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Incident ID:</strong> ${incidentId}</p>
        <p style="margin: 5px 0;"><strong>Reported By:</strong> ${reportedBy}</p>
        <p style="margin: 5px 0;"><strong>Related Booking:</strong> ${bookingId}</p>
        <p style="margin: 5px 0;"><strong>Type:</strong> <span style="background: #fecaca; padding: 2px 8px; border-radius: 4px;">${incidentType}</span></p>
      </div>
      
      <div style="background: white; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Description:</strong></p>
        <p style="white-space: pre-wrap; line-height: 1.6;">${description}</p>
      </div>
      
      <p style="background: #fef3c7; padding: 15px; border-radius: 8px;">
        <strong>Action Required:</strong> Please review this incident in the admin dashboard.
      </p>
      
      <p style="color: #6b7280; font-size: 12px;">
        Reported at ${new Date().toLocaleString('en-GB', {
          dateStyle: 'full',
          timeStyle: 'short'
        })}
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `[INCIDENT] ${incidentType} - ${incidentId}`,
    html,
  });
}

// Welcome email for new users
export async function sendWelcomeEmail({ to, userName, userRole }) {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">👋 Welcome to NEAT Transport!</h2>
      
      <p>Hi ${userName},</p>
      
      <p>Thank you for joining NEAT Transport. Your ${userRole.toLowerCase()} account has been created successfully.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" 
           style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Getting Started</h3>
        <ul style="margin: 10px 0;">
          <li>Complete your profile</li>
          ${userRole === 'DRIVER' ? '<li>Upload your credentials (DBS, insurance, license)</li>' : ''}
          ${userRole === 'MANAGER' ? '<li>Add your care homes and residents</li>' : ''}
          <li>Explore the platform features</li>
        </ul>
      </div>
      
      <p>If you have any questions, please don't hesitate to <a href="${process.env.NEXTAUTH_URL}/contact">contact us</a>.</p>
      
      <p style="color: #6b7280; font-size: 12px;">
        Need help? Visit our <a href="${process.env.NEXTAUTH_URL}/how-it-works">How It Works</a> page.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to NEAT Transport! 🚗',
    html,
  });
}
