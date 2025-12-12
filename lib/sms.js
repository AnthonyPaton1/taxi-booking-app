// lib/sms.js

import twilio from 'twilio';

// Check if SMS is enabled (based on funding/config)
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';
const TWILIO_CONFIGURED = !!(
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_PHONE_NUMBER
);

const client = TWILIO_CONFIGURED 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendSMS({ to, message, userId }) {
  // Feature flag check
  if (!SMS_ENABLED) {
    console.log('📱 [SMS DEMO MODE] Would send SMS to', to, ':', message);
    return { 
      success: true, 
      demo: true, 
      message: 'SMS functionality available with premium plan' 
    };
  }

  if (!TWILIO_CONFIGURED) {
    console.error('❌ Twilio not configured');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    // Format phone number
    const formattedPhone = to.startsWith('+') ? to : `+44${to.replace(/^0/, '')}`;
    
    // Check SMS quota (prevent runaway costs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const smsCount = await prisma.smsLog.count({
      where: {
        userId,
        sentAt: { gte: today }
      }
    });
    
    const MAX_SMS_PER_DAY = 10;
    
    if (smsCount >= MAX_SMS_PER_DAY) {
      console.log(`❌ SMS limit reached for user ${userId} (${smsCount}/${MAX_SMS_PER_DAY})`);
      return { success: false, error: 'Daily SMS limit reached' };
    }
    
    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    
    // Log SMS sent
    await prisma.smsLog.create({
      data: {
        userId,
        phoneNumber: to,
        message,
        twilioSid: result.sid,
        costCents: 4, // 4p per SMS
        sentAt: new Date()
      }
    });
    
    console.log(`✅ SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return { success: false, error: error.message };
  }
}

// Admin function to check SMS costs
export async function getSMSStats(startDate, endDate) {
  const logs = await prisma.smsLog.findMany({
    where: {
      sentAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  return {
    totalSent: logs.length,
    totalCostPounds: (logs.reduce((sum, log) => sum + (log.costCents || 4), 0) / 100).toFixed(2),
    byUser: logs.reduce((acc, log) => {
      acc[log.userId] = (acc[log.userId] || 0) + 1;
      return acc;
    }, {})
  };
}