// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // ==========================================
  // 1. ADMINS & BUSINESSES
  // ==========================================
  
  const careHomeAdmin = await prisma.user.upsert({
    where: { email: 'admin@sunnycarehome.co.uk' },
    update: {},
    create: {
      email: 'admin@sunnycarehome.co.uk',
      name: 'Sarah Johnson',
      phone: '01614961234',
      password: hashedPassword,
      role: 'ADMIN',
      adminOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const careHomeBusiness = await prisma.business.upsert({
    where: { id: 'care-home-1' },
    update: {},
    create: {
      id: 'care-home-1',
      name: 'Sunny Days Care Home',
      type: 'CARE_HOME',
      adminUser: { connect: { id: careHomeAdmin.id } },
      address1: '123 Wellington Road',
      postcode: 'SK4 1AA',
      city: 'Stockport',
      phone: '01614961234',
    },
  });

  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'admin@oakwoodschool.org.uk' },
    update: {},
    create: {
      email: 'admin@oakwoodschool.org.uk',
      name: 'David Thompson',
      phone: '01618721234',
      password: hashedPassword,
      role: 'ADMIN',
      adminOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const schoolBusiness = await prisma.business.upsert({
    where: { id: 'school-1' },
    update: {},
    create: {
      id: 'school-1',
      name: 'Oakwood Special Needs School',
      type: 'SCHOOL',
      adminUser: { connect: { id: schoolAdmin.id } },
      address1: '45 Oxford Road',
      postcode: 'M1 5GD',
      city: 'Manchester',
      phone: '01618721234',
    },
  });

  const councilAdmin = await prisma.user.upsert({
    where: { email: 'transport@salford.gov.uk' },
    update: {},
    create: {
      email: 'transport@salford.gov.uk',
      name: 'James Wilson',
      phone: '01617931234',
      password: hashedPassword,
      role: 'ADMIN',
      adminOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const councilBusiness = await prisma.business.upsert({
    where: { id: 'council-1' },
    update: {},
    create: {
      id: 'council-1',
      name: 'Salford City Council Transport',
      type: 'COUNCIL',
      adminUser: { connect: { id: councilAdmin.id } },
      address1: 'Civic Centre, Chorley Road',
      postcode: 'M27 5AW',
      city: 'Salford',
      phone: '01617931234',
    },
  });

  console.log('✅ Created 3 businesses with admins');

  // ==========================================
  // 2. COORDINATORS
  // ==========================================
  
  const coordinator1 = await prisma.user.upsert({
    where: { email: 'coordinator@sunnycarehome.co.uk' },
    update: {},
    create: {
      email: 'coordinator@sunnycarehome.co.uk',
      name: 'Emma Roberts',
      phone: '01614962345',
      password: hashedPassword,
      role: 'COORDINATOR',
      businessId: careHomeBusiness.id,
      coordinatorOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const coordinator2 = await prisma.user.upsert({
    where: { email: 'coordinator@oakwoodschool.org.uk' },
    update: {},
    create: {
      email: 'coordinator@oakwoodschool.org.uk',
      name: 'Michael Brown',
      phone: '01618722345',
      password: hashedPassword,
      role: 'COORDINATOR',
      businessId: schoolBusiness.id,
      coordinatorOnboarded: true,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created 2 coordinators');

  // ==========================================
  // 3. MANAGERS
  // ==========================================
  
  const manager1 = await prisma.user.upsert({
    where: { email: 'manager1@sunnycarehome.co.uk' },
    update: {},
    create: {
      email: 'manager1@sunnycarehome.co.uk',
      name: 'Jennifer Martinez',
      phone: '01614963456',
      password: hashedPassword,
      role: 'MANAGER',
      businessId: careHomeBusiness.id,
      managerOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const manager2 = await prisma.user.upsert({
    where: { email: 'manager2@sunnycarehome.co.uk' },
    update: {},
    create: {
      email: 'manager2@sunnycarehome.co.uk',
      name: 'Steven Clarke',
      phone: '01614964567',
      password: hashedPassword,
      role: 'MANAGER',
      businessId: careHomeBusiness.id,
      managerOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const manager3 = await prisma.user.upsert({
    where: { email: 'manager@oakwoodschool.org.uk' },
    update: {},
    create: {
      email: 'manager@oakwoodschool.org.uk',
      name: 'Rachel Green',
      phone: '01618723456',
      password: hashedPassword,
      role: 'MANAGER',
      businessId: schoolBusiness.id,
      managerOnboarded: true,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created 3 managers');

  // ==========================================
  // 4. DRIVERS
  // ==========================================

  // Driver 1: Full WAV - Stockport
  const driver1User = await prisma.user.upsert({
    where: { email: 'driver1@neatransport.co.uk' },
    update: {},
    create: {
      email: 'driver1@neatransport.co.uk',
      name: 'John Smith',
      phone: '07700900001',
      password: hashedPassword,
      role: 'DRIVER',
      driverOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      name: 'John Smith',
      phone: '07700900001',
      user: { connect: { id: driver1User.id } },
      vehicleType: 'WAV',
      vehicleReg: 'WA21 XYZ',
      amenities: ['Wheelchair Ramp', 'Hoist', 'High Roof'],
      localPostcode: 'SK3 9DT',
      radiusMiles: 35,
      approved: true,
      hasWAV: true,
      hasStandard: false,
      wavOnly: true,
      completedRides: 156,
      rating: 4.8,
      accessibilityProfile: {
        create: {
          vehicleType: 'WAV',
          wheelchairAccess: true,
          highRoof: true,
          seatTransferHelp: true,
          mobilityAidStorage: true,
          firstAidTrained: true,
          passengerCount: 6,
          wheelchairUsers: 2,
        }
      }
    },
  });

  await prisma.driverCompliance.create({
    data: {
      driverId: driver1.id,
      ukDrivingLicence: true,
      licenceNumber: 'SMITH123456JD9AB',
      localAuthorityRegistered: true,
      dbsChecked: true,
      publicLiabilityInsurance: true,
      fullyCompInsurance: true,
      healthCheckPassed: true,
      englishProficiency: true,
    },
  });

  console.log('✅ Driver 1: John Smith (Full WAV)');

  // Driver 2: Saloon - Manchester
  const driver2User = await prisma.user.upsert({
    where: { email: 'driver2@neatransport.co.uk' },
    update: {},
    create: {
      email: 'driver2@neatransport.co.uk',
      name: 'Mary Johnson',
      phone: '07700900002',
      password: hashedPassword,
      role: 'DRIVER',
      driverOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: 'Mary Johnson',
      phone: '07700900002',
      user: { connect: { id: driver2User.id } },
      vehicleType: 'Saloon',
      vehicleReg: 'MN21 ABC',
      amenities: ['Seat Belts', 'Booster Seats', 'Induction Loop'],
      localPostcode: 'M15 5NN',
      radiusMiles: 30,
      approved: true,
      hasWAV: false,
      hasStandard: true,
      wavOnly: false,
      completedRides: 203,
      rating: 4.9,
      accessibilityProfile: {
        create: {
          vehicleType: 'standard',
          seatTransferHelp: true,
          firstAidTrained: true,
          passengerCount: 4,
        }
      }
    },
  });

  await prisma.driverCompliance.create({
    data: {
      driverId: driver2.id,
      ukDrivingLicence: true,
      licenceNumber: 'JOHNS123456MJ9CD',
      localAuthorityRegistered: true,
      dbsChecked: true,
      publicLiabilityInsurance: true,
      fullyCompInsurance: true,
      healthCheckPassed: true,
      englishProficiency: true,
    },
  });

  console.log('✅ Driver 2: Mary Johnson (Saloon)');

  // Driver 3: Basic WAV - Salford
  const driver3User = await prisma.user.upsert({
    where: { email: 'driver3@neatransport.co.uk' },
    update: {},
    create: {
      email: 'driver3@neatransport.co.uk',
      name: 'Ahmed Khan',
      phone: '07700900003',
      password: hashedPassword,
      role: 'DRIVER',
      driverOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      name: 'Ahmed Khan',
      phone: '07700900003',
      user: { connect: { id: driver3User.id } },
      vehicleType: 'WAV',
      vehicleReg: 'SF21 DEF',
      amenities: ['Wheelchair Ramp', 'Seat Belts'],
      localPostcode: 'M6 6BG',
      radiusMiles: 25,
      approved: true,
      hasWAV: true,
      hasStandard: false,
      wavOnly: true,
      completedRides: 89,
      rating: 4.5,
      accessibilityProfile: {
        create: {
          vehicleType: 'WAV',
          wheelchairAccess: true,
          mobilityAidStorage: true,
          passengerCount: 4,
          wheelchairUsers: 1,
        }
      }
    },
  });

  await prisma.driverCompliance.create({
    data: {
      driverId: driver3.id,
      ukDrivingLicence: true,
      licenceNumber: 'KHANA123456AK9EF',
      localAuthorityRegistered: true,
      dbsChecked: true,
      publicLiabilityInsurance: true,
      fullyCompInsurance: true,
      healthCheckPassed: true,
      englishProficiency: true,
    },
  });

  console.log('✅ Driver 3: Ahmed Khan (Basic WAV)');

  // Driver 4: Minibus - Bolton
  const driver4User = await prisma.user.upsert({
    where: { email: 'driver4@neatransport.co.uk' },
    update: {},
    create: {
      email: 'driver4@neatransport.co.uk',
      name: 'Patricia O\'Brien',
      phone: '07700900004',
      password: hashedPassword,
      role: 'DRIVER',
      driverOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const driver4 = await prisma.driver.create({
    data: {
      name: 'Patricia O\'Brien',
      phone: '07700900004',
      user: { connect: { id: driver4User.id } },
      vehicleType: 'Minibus',
      vehicleReg: 'BL21 GHI',
      amenities: ['Wheelchair Ramp', 'Seat Belts', 'Booster Seats', 'High Roof', '12 Seats'],
      localPostcode: 'BL1 4QR',
      radiusMiles: 40,
      approved: true,
      hasWAV: true,
      hasStandard: true,
      wavOnly: false,
      completedRides: 134,
      rating: 4.7,
      accessibilityProfile: {
        create: {
          vehicleType: 'either',
          wheelchairAccess: true,
          mobilityAidStorage: true,
          passengerCount: 12,
          wheelchairUsers: 2,
        }
      }
    },
  });

  await prisma.driverCompliance.create({
    data: {
      driverId: driver4.id,
      ukDrivingLicence: true,
      licenceNumber: 'OBRIE123456PO9GH',
      localAuthorityRegistered: true,
      dbsChecked: true,
      publicLiabilityInsurance: true,
      fullyCompInsurance: true,
      healthCheckPassed: true,
      englishProficiency: true,
    },
  });

  console.log('✅ Driver 4: Patricia O\'Brien (Minibus)');

  // Driver 5: Estate - Bury
  const driver5User = await prisma.user.upsert({
    where: { email: 'driver5@neatransport.co.uk' },
    update: {},
    create: {
      email: 'driver5@neatransport.co.uk',
      name: 'Robert Davies',
      phone: '07700900005',
      password: hashedPassword,
      role: 'DRIVER',
      driverOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const driver5 = await prisma.driver.create({
    data: {
      name: 'Robert Davies',
      phone: '07700900005',
      user: { connect: { id: driver5User.id } },
      vehicleType: 'Estate',
      vehicleReg: 'BY21 JKL',
      amenities: ['Seat Belts'],
      localPostcode: 'BL9 0EE',
      radiusMiles: 20,
      approved: true,
      hasWAV: false,
      hasStandard: true,
      wavOnly: false,
      completedRides: 67,
      rating: 4.3,
      accessibilityProfile: {
        create: {
          vehicleType: 'standard',
          passengerCount: 5,
        }
      }
    },
  });

  await prisma.driverCompliance.create({
    data: {
      driverId: driver5.id,
      ukDrivingLicence: true,
      licenceNumber: 'DAVIE123456RD9IJ',
      localAuthorityRegistered: true,
      dbsChecked: true,
      publicLiabilityInsurance: true,
      fullyCompInsurance: true,
      healthCheckPassed: true,
      englishProficiency: true,
    },
  });

  console.log('✅ Driver 5: Robert Davies (Estate)');

  // Driver 6: MPV - Oldham
  const driver6User = await prisma.user.upsert({
    where: { email: 'driver6@neatransport.co.uk' },
    update: {},
    create: {
      email: 'driver6@neatransport.co.uk',
      name: 'Linda Chen',
      phone: '07700900006',
      password: hashedPassword,
      role: 'DRIVER',
      driverOnboarded: true,
      emailVerified: new Date(),
    },
  });

  const driver6 = await prisma.driver.create({
    data: {
      name: 'Linda Chen',
      phone: '07700900006',
      user: { connect: { id: driver6User.id } },
      vehicleType: 'MPV',
      vehicleReg: 'OL21 MNO',
      amenities: ['Seat Belts', 'Booster Seats', 'Induction Loop', '7 Seats'],
      localPostcode: 'OL1 3BD',
      radiusMiles: 30,
      approved: true,
      hasWAV: false,
      hasStandard: true,
      wavOnly: false,
      completedRides: 178,
      rating: 4.9,
      accessibilityProfile: {
        create: {
          vehicleType: 'standard',
          signLanguageRequired: true,
          firstAidTrained: true,
          passengerCount: 7,
        }
      }
    },
  });

  await prisma.driverCompliance.create({
    data: {
      driverId: driver6.id,
      ukDrivingLicence: true,
      licenceNumber: 'CHENH123456LC9KL',
      localAuthorityRegistered: true,
      dbsChecked: true,
      publicLiabilityInsurance: true,
      fullyCompInsurance: true,
      healthCheckPassed: true,
      englishProficiency: true,
    },
  });

  console.log('✅ Driver 6: Linda Chen (MPV)');

  console.log('');
  console.log('✅ Seed completed successfully!');
  console.log('📊 Summary:');
  console.log('  - 3 Businesses (Care Home, School, Council)');
  console.log('  - 3 Admins, 2 Coordinators, 3 Managers');
  console.log('  - 6 Drivers with varied vehicles across GM');
  console.log('');
  console.log('🔐 All users: Password123!');
  console.log('');
  console.log('📍 Postcodes: SK3, M15, M6, BL1, BL9, OL1');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });