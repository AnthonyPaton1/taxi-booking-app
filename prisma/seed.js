// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const password = await bcrypt.hash("password123", 10);

  // Step 1: Create users for each role
  const roles = [
    { email: "superadmin@example.com", name: "Super Admin", role: "SUPER_ADMIN" },
    { email: "admin@example.com", name: "Business Admin", role: "ADMIN" },
    { email: "manager@example.com", name: "House Manager", role: "MANAGER" },
    { email: "coordinator@example.com", name: "Coordinator", role: "COORDINATOR" },
    { email: "driver@example.com", name: "Driver User", role: "DRIVER" },
    { email: "public@example.com", name: "Public User", role: "PUBLIC" },
  ];

  const createdUsers = {};

  for (const r of roles) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        name: r.name,
        password,
        role: r.role,
        isApproved: true,
        driverOnboarded: r.role === "DRIVER" ? false : false,
        adminOnboarded: r.role === "ADMIN" ? false : false,
        managerOnboarded: r.role === "MANAGER" ? false : false,
        coordinatorOnboarded: r.role === "COORDINATOR" ? false : false,
      },
    });
    createdUsers[r.role] = user;
    console.log(`✅ Created user: ${r.name} (${r.email})`);
  }

  // Step 2: Create a sample Business (for admin user)
  const business = await prisma.business.create({
    data: {
      type: "CARE",
      name: "Test Care Home Company",
      phone: "0161 123 4567",
      email: "info@testcarehome.co.uk",
      website: "https://testcarehome.co.uk",
      address1: "123 Test Street",
      city: "Manchester",
      postcode: "M1 1AA",
      approved: true,
      adminUserId: createdUsers.ADMIN.id,
    },
  });
  console.log(`✅ Created business: ${business.name}`);

  // Step 3: Create an Area
  const area = await prisma.area.create({
    data: {
      name: "Greater Manchester",
    },
  });
  console.log(`✅ Created area: ${area.name}`);

  // Step 4: Create a sample Driver with AccessibilityProfile and Compliance
  
  // First create the accessibility profile
  const driverAccessibilityProfile = await prisma.accessibilityProfile.create({
    data: {
      wheelchairAccess: true,
      highRoof: true,
      quietEnvironment: true,
      assistanceRequired: true,
      passengerCount: 4,
      wheelchairUsers: 1,
      specificMusic: "Passenger choice",
      femaleDriverOnly: false,
      firstAidTrained: true,
      conditionAwareness: true,
    },
  });

  // Then create the driver
  const driver = await prisma.driver.create({
    data: {
      userId: createdUsers.DRIVER.id,
      name: "John Driver",
      vehicleType: "WAV",
      vehicleReg: "AB12 CDE",
      amenities: ["High roof", "Side step", "Hydraulic lift"],
      localPostcode: "M1 2AB",
      radiusMiles: 15,
      phone: "07123 456789",
      approved: true,
      accessibilityProfileId: driverAccessibilityProfile.id,
    },
  });
  console.log(`✅ Created driver: ${driver.name}`);

  // Create driver compliance
  const driverCompliance = await prisma.driverCompliance.create({
    data: {
      driverId: driver.id,
      ukDrivingLicence: true,
      licenceNumber: "DRIVE123456789",
      localAuthorityRegistered: true,
      dbsChecked: true,
      publicLiabilityInsurance: true,
      fullyCompInsurance: true,
      healthCheckPassed: true,
      englishProficiency: true,
    },
  });
  console.log(`✅ Created driver compliance for: ${driver.name}`);

  // Step 5: Create a sample InstantBooking with AccessibilityProfile
  const bookingAccessibilityProfile = await prisma.accessibilityProfile.create({
    data: {
      wheelchairAccess: true,
      passengerCount: 2,
      wheelchairUsers: 1,
      quietEnvironment: false,
      assistanceRequired: true,
    },
  });

  const instantBooking = await prisma.instantBooking.create({
    data: {
      createdById: createdUsers.PUBLIC.id,
      pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      pickupLocation: "123 Pickup Street, Manchester",
      dropoffLocation: "456 Dropoff Avenue, Manchester",
      initials: ["JD"],
      status: "PENDING",
      accessibilityProfileId: bookingAccessibilityProfile.id,
      estimatedCostPence: 2500, // £25.00
    },
  });
  console.log(`✅ Created instant booking from ${instantBooking.pickupLocation}`);

  // Step 6: Create a sample AdvancedBooking with AccessibilityProfile
  const advancedBookingAccessibilityProfile = await prisma.accessibilityProfile.create({
    data: {
      wheelchairAccess: true,
      doubleWheelchairAccess: true,
      passengerCount: 3,
      wheelchairUsers: 2,
      carerPresent: true,
      medicationOnBoard: true,
      conditionAwareness: true,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  tomorrow.setHours(10, 0, 0, 0);

  const advancedBooking = await prisma.advancedBooking.create({
    data: {
      createdById: createdUsers.MANAGER.id,
      businessId: business.id,
      pickupTime: tomorrow,
      pickupLocation: "Care Home, 789 Care Street, Manchester",
      dropoffLocation: "Hospital, 321 Medical Road, Manchester",
      initials: ["AB", "CD"],
      status: "OPEN",
      visibility: "PRIVATE_TO_COMPANY",
      bidDeadline: new Date(tomorrow.getTime() - 24 * 60 * 60 * 1000), // 1 day before pickup
      accessibilityProfileId: advancedBookingAccessibilityProfile.id,
    },
  });
  console.log(`✅ Created advanced booking for ${advancedBooking.pickupTime}`);

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Test accounts created:");
  console.log("   Super Admin: superadmin@example.com / password123");
  console.log("   Admin:       admin@example.com / password123");
  console.log("   Manager:     manager@example.com / password123");
  console.log("   Coordinator: coordinator@example.com / password123");
  console.log("   Driver:      driver@example.com / password123");
  console.log("   Public:      public@example.com / password123");
  console.log("\n✨ Sample data:");
  console.log(`   - 1 Business (${business.name})`);
  console.log(`   - 1 Driver (${driver.name}) with full profile`);
  console.log(`   - 1 Instant booking (PENDING)`);
  console.log(`   - 1 Advanced booking (OPEN for bidding)`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });