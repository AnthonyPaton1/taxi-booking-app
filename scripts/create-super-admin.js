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
      rl.close();
      process.exit(1);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      console.log('\n💡 Tip: Create the user first by:');
      console.log('   1. Signing up through the website, OR');
      console.log('   2. Using the admin invite system');
      console.log('\nThen run this script again.');
      rl.close();
      process.exit(1);
    }

    if (user.role === 'SUPER_ADMIN') {
      console.log(`✅ ${email} is already a Super Admin!`);
      rl.close();
      process.exit(0);
    }

    // Show current user details
    console.log(`\n📋 Current User Details:`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Approved: ${user.isApproved ? 'Yes' : 'No'}`);

    // Confirm
    const confirm = await question(`\n⚠️  Are you sure you want to promote ${email} to SUPER_ADMIN? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled');
      rl.close();
      process.exit(0);
    }

    // Update user to SUPER_ADMIN
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        role: 'SUPER_ADMIN',
        isApproved: true,
        emailVerified: new Date(), //  Good addition
        driverOnboarded: true, //  Skip onboarding for super admin
        adminOnboarded: true,  //  Skip onboarding for super admin
      }
    });

    console.log(`\n Success! ${email} is now a SUPER_ADMIN`);
    console.log('\n🚀 Super Admin Powers Granted:');
    console.log('   • Access /dashboard/super-admin');
    console.log('   • Access ALL other dashboards (admin, manager, driver, coordinator)');
    console.log('   • Approve/reject drivers');
    console.log('   • View SMS costs and analytics');
    console.log('   • Full system management');
    console.log('   • No restrictions on any routes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createSuperAdmin();