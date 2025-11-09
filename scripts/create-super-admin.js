// scripts/create-super-admin.js
// Run with: node scripts/create-super-admin.js

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
  try {
    console.log('\n🔐 Super Admin Setup\n');
    
    const email = await question('Enter email address to promote to Super Admin: ');
    
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      console.log('\nCreate the user first, then run this script again.');
      process.exit(1);
    }

    if (user.role === 'SUPER_ADMIN') {
      console.log(`✅ ${email} is already a Super Admin!`);
      process.exit(0);
    }

    // Confirm
    const confirm = await question(`\n⚠️  Are you sure you want to promote ${email} to SUPER_ADMIN? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    // Update user to SUPER_ADMIN
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        role: 'SUPER_ADMIN',
        isApproved: true,
        emailVerified: new Date()
      }
    });

    console.log(`\n✅ Success! ${email} is now a SUPER_ADMIN`);
    console.log('\nYou can now login and access:');
    console.log('- /dashboard/super-admin');
    console.log('- All admin functions');
    console.log('- Driver approvals');
    console.log('- System management\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createSuperAdmin();