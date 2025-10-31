const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n=== CHECKING ALL DATA ===\n');

  // 1. Check Drivers
  const drivers = await prisma.driver.findMany({
    include: { user: true }
  });

  console.log(`📍 DRIVERS (${drivers.length}):`);
  drivers.forEach(d => {
    console.log(`\n  ${d.name}`);
    console.log(`    Email: ${d.user.email}`);
    console.log(` Name: ${d.name}`);
    console.log(`    Phone: ${d.phone || 'NULL'}`);
    console.log(`    Approved: ${d.approved}`);
    console.log(`    Vehicle: WAV=${d.hasWAV}, Standard=${d.hasStandard}, WAVOnly=${d.wavOnly}`);
    console.log(`    Location: lat=${d.baseLat || 'NULL'}, lng=${d.baseLng || 'NULL'}`);
    console.log(`    Radius: ${d.radiusMiles || 'NULL'} miles`);
    console.log(`    Gender: ${d.gender || 'NULL'}`);
    console.log(`    Rating: ${d.rating}, Rides: ${d.completedRides}`);
    
  });

 

  // 2. Check Businesses
  const businesses = await prisma.business.findMany({
    include: { adminUser: true }
  });

  console.log(`\n\n🏢 BUSINESSES (${businesses.length}):`);
  businesses.forEach(b => {
    console.log(`\n  ${b.name} (${b.type})`);
    console.log(`    Admin: ${b.adminUser.name} (${b.adminUser.email})`);
    console.log(`    Phone: ${b.phone || 'NULL'}`);
    console.log(`    Email: ${b.email || 'NULL'}`);
    console.log(`    Approved: ${b.approved}`);
    console.log(`    Location: lat=${b.lat || 'NULL'}, lng=${b.lng || 'NULL'}`);
  });

  // 3. Check Users by role
  const managers = await prisma.user.findMany({ where: { role: 'MANAGER' } });
  const coordinators = await prisma.user.findMany({ where: { role: 'COORDINATOR' } });
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });

  console.log(`\n\n👥 USERS BY ROLE:`);
  console.log(`  MANAGERS (${managers.length}):`);
  managers.forEach(u => console.log(`    - ${u.name} (${u.email}) - onboarded: ${u.managerOnboarded}`));
  
  console.log(`  COORDINATORS (${coordinators.length}):`);
  coordinators.forEach(u => console.log(`    - ${u.name} (${u.email}) - onboarded: ${u.coordinatorOnboarded}`));
  
  console.log(`  ADMINS (${admins.length}):`);
  admins.forEach(u => console.log(`    - ${u.name} (${u.email}) - onboarded: ${u.adminOnboarded}`));

  // 4. Check Bookings
  const advancedBookings = await prisma.advancedBooking.findMany({
    include: { accessibilityProfile: true }
  });
  const instantBookings = await prisma.instantBooking.findMany({
    include: { accessibilityProfile: true }
  });

  console.log(`\n\n📅 ADVANCED BOOKINGS (${advancedBookings.length}):`);
  advancedBookings.forEach(b => {
    console.log(`\n  ${b.id.substring(0, 8)}... - ${b.status}`);
    console.log(`    Pickup: ${b.pickupLocation} (${b.pickupLatitude || 'NULL'}, ${b.pickupLongitude || 'NULL'})`);
    console.log(`    Dropoff: ${b.dropoffLocation} (${b.dropoffLatitude || 'NULL'}, ${b.dropoffLongitude || 'NULL'})`);
    console.log(`    Time: ${b.pickupTime}`);
    console.log(`    Vehicle needed: ${b.accessibilityProfile.vehicleType || 'either'}`);
    console.log(`    Wheelchair: ${b.accessibilityProfile.wheelchairAccess}`);
    console.log(`    Wheelchair users: ${b.accessibilityProfile.wheelchairUsers || 0}`);
  });
  console.log(`\n\n📅 INSTANT BOOKINGS (${instantBookings.length}):`);
  instantBookings.forEach(b => {
    console.log(`\n  ${b.id.substring(0, 8)}... - ${b.status}`);
    console.log(`    Pickup: ${b.pickupLocation} (${b.pickupLatitude || 'NULL'}, ${b.pickupLongitude || 'NULL'})`);
    console.log(`    Dropoff: ${b.dropoffLocation} (${b.dropoffLatitude || 'NULL'}, ${b.dropoffLongitude || 'NULL'})`);
    console.log(`    Time: ${b.pickupTime}`);
    console.log(`    Vehicle needed: ${b.accessibilityProfile.vehicleType || 'either'}`);
    console.log(`    Wheelchair: ${b.accessibilityProfile.wheelchairAccess}`);
    console.log(`    Wheelchair users: ${b.accessibilityProfile.wheelchairUsers || 0}`);
  });

  console.log('\n=== END ===\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());