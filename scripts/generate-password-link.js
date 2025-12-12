// scripts/generate-password-link.js

import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function generatePasswordLink() {
  const email = process.argv[2] || process.env.SUPER_ADMIN_EMAIL;
  
  if (!email) {
    console.error('Usage: node scripts/generate-password-link.js email@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Delete old tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new token
    const token = nanoid(24);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });

    // Verify email and approve user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        isApproved: true,
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const setPasswordUrl = `${baseUrl}/set-password?token=${token}`;

    console.log('\n✅ Password reset link generated!\n');
    console.log('📧 Email:', email);
    console.log('🔗 Link:\n');
    console.log(`   ${setPasswordUrl}\n`);
    console.log('📋 Copy the link above and paste it in your browser to set your password.\n');
    console.log('⏰ Link expires in 24 hours.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

generatePasswordLink();