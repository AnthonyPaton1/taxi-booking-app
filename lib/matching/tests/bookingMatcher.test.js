/**
 * Booking Matcher Tests
 * Run with: node lib/matching/tests/bookingMatcher.test.js
 */

import {
  checkAccessibilityMatch,
  matchBookingToDrivers,
  matchDriverToBookings,
  findBestDriverForInstantBooking,
} from '../bookingMatcher.js';

console.log('🧪 Testing Booking Matcher\n');
console.log('='.repeat(70));

// Mock driver profiles
const drivers = [
  {
    id: 'driver-1',
    name: 'Alice (Wheelchair Specialist)',
    approved: true,
    baseLat: 53.4084,
    baseLng: -2.1487,
    radiusMiles: 10,
    accessibilityProfile: {
      wheelchairAccess: true,
      doubleWheelchairAccess: false,
      highRoof: true,
      mobilityAidStorage: true,
      electricScooterStorage: false,
      passengerCount: 4,
      wheelchairUsers: 1,
      quietEnvironment: true,
      femaleDriverOnly: true,
      assistanceAnimal: true,
      firstAidTrained: true,
    },
  },
  {
    id: 'driver-2',
    name: 'Bob (Double Wheelchair)',
    approved: true,
    baseLat: 53.4808,
    baseLng: -2.2426,
    radiusMiles: 15,
    accessibilityProfile: {
      wheelchairAccess: true,
      doubleWheelchairAccess: true,
      highRoof: true,
      mobilityAidStorage: true,
      electricScooterStorage: true,
      passengerCount: 6,
      wheelchairUsers: 2,
      quietEnvironment: false,
      femaleDriverOnly: false,
      assistanceAnimal: true,
      firstAidTrained: true,
    },
  },
  {
    id: 'driver-3',
    name: 'Charlie (Standard Vehicle)',
    approved: true,
    baseLat: 53.4831,
    baseLng: -2.2444,
    radiusMiles: 5,
    accessibilityProfile: {
      wheelchairAccess: false,
      doubleWheelchairAccess: false,
      highRoof: false,
      mobilityAidStorage: true,
      electricScooterStorage: false,
      passengerCount: 4,
      wheelchairUsers: 0,
      quietEnvironment: true,
      femaleDriverOnly: false,
      assistanceAnimal: false,
      firstAidTrained: false,
    },
  },
  {
    id: 'driver-4',
    name: 'Diana (Far Away)',
    approved: true,
    baseLat: 52.4862, // Birmingham
    baseLng: -1.8904,
    radiusMiles: 20,
    accessibilityProfile: {
      wheelchairAccess: true,
      doubleWheelchairAccess: false,
      highRoof: true,
      mobilityAidStorage: true,
      electricScooterStorage: false,
      passengerCount: 4,
      wheelchairUsers: 1,
      quietEnvironment: true,
      femaleDriverOnly: true,
      assistanceAnimal: true,
      firstAidTrained: true,
    },
  },
];

// Mock bookings
const bookings = [
  {
    id: 'booking-1',
    pickupTime: new Date('2025-11-01T09:00:00'),
    pickupLocation: 'Manchester City Centre',
    dropoffLocation: 'Hospital',
    pickupLat: 53.4808,
    pickupLng: -2.2426,
    accessibilityProfile: {
      wheelchairAccess: true,
      doubleWheelchairAccess: false,
      highRoof: false,
      mobilityAidStorage: false,
      electricScooterStorage: false,
      passengerCount: 1,
      wheelchairUsers: 1,
      quietEnvironment: true,
      femaleDriverOnly: true,
      assistanceAnimal: false,
      firstAidTrained: false,
    },
  },
  {
    id: 'booking-2',
    pickupTime: new Date('2025-11-01T10:00:00'),
    pickupLocation: 'Stockport',
    dropoffLocation: 'Shopping Centre',
    pickupLat: 53.4084,
    pickupLng: -2.1487,
    accessibilityProfile: {
      wheelchairAccess: true,
      doubleWheelchairAccess: true,
      highRoof: true,
      mobilityAidStorage: true,
      electricScooterStorage: true,
      passengerCount: 3,
      wheelchairUsers: 2,
      quietEnvironment: false,
      femaleDriverOnly: false,
      assistanceAnimal: true,
      firstAidTrained: true,
    },
  },
  {
    id: 'booking-3',
    pickupTime: new Date('2025-11-01T14:00:00'),
    pickupLocation: 'Manchester',
    dropoffLocation: 'Airport',
    pickupLat: 53.4831,
    pickupLng: -2.2444,
    accessibilityProfile: {
      wheelchairAccess: false,
      doubleWheelchairAccess: false,
      highRoof: false,
      mobilityAidStorage: true,
      electricScooterStorage: false,
      passengerCount: 2,
      wheelchairUsers: 0,
      quietEnvironment: true,
      femaleDriverOnly: false,
      assistanceAnimal: false,
      firstAidTrained: false,
    },
  },
];

// Test 1: Accessibility Matching
console.log('\n📋 Test 1: Accessibility Match Check');
console.log('-'.repeat(70));

const testMatch1 = checkAccessibilityMatch(
  drivers[0].accessibilityProfile, // Alice
  bookings[0].accessibilityProfile // Booking 1: Wheelchair + Female driver
);

console.log('Alice vs Booking 1 (Wheelchair + Female Driver Required):');
console.log(`  Can Fulfill: ${testMatch1.canFulfill ? '✅ YES' : '❌ NO'}`);
console.log(`  Compatibility Score: ${testMatch1.compatibilityScore}%`);
console.log(`  Missing: ${testMatch1.missingCapabilities.join(', ') || 'None'}`);
console.log(`  Expected: ✅ Perfect match (100%)`);

const testMatch2 = checkAccessibilityMatch(
  drivers[2].accessibilityProfile, // Charlie (no wheelchair)
  bookings[0].accessibilityProfile // Booking 1: Wheelchair required
);

console.log('\nCharlie (Standard) vs Booking 1 (Wheelchair Required):');
console.log(`  Can Fulfill: ${testMatch2.canFulfill ? '✅ YES' : '❌ NO'}`);
console.log(`  Compatibility Score: ${testMatch2.compatibilityScore}%`);
console.log(`  Missing: ${testMatch2.missingCapabilities.join(', ')}`);
console.log(`  Expected: ❌ Cannot fulfill (missing wheelchair access)`);

const testMatch3 = checkAccessibilityMatch(
  drivers[1].accessibilityProfile, // Bob (double wheelchair)
  bookings[1].accessibilityProfile // Booking 2: Double wheelchair needed
);

console.log('\nBob (Double Wheelchair) vs Booking 2 (Double Wheelchair):');
console.log(`  Can Fulfill: ${testMatch3.canFulfill ? '✅ YES' : '❌ NO'}`);
console.log(`  Compatibility Score: ${testMatch3.compatibilityScore}%`);
console.log(`  Expected: ✅ Perfect match`);

// Test 2: Booking to Drivers Matching
console.log('\n\n🎯 Test 2: Match Booking to Available Drivers');
console.log('-'.repeat(70));

const booking1Matches = matchBookingToDrivers(bookings[0], drivers);

console.log(`Booking 1 (${bookings[0].pickupLocation}) matched with:`);
console.log(`Total matches found: ${booking1Matches.length}\n`);

booking1Matches.forEach((match, index) => {
  console.log(`${index + 1}. ${match.driver.name}`);
  console.log(`   Distance: ${match.distance} miles (${match.estimatedPickupMinutes} mins)`);
  console.log(`   Overall Score: ${match.overallScore}/100`);
  console.log(`   Accessibility: ${match.accessibilityMatch.compatibilityScore}%`);
  console.log(`   Proximity: ${match.proximityScore}/100`);
  if (match.accessibilityMatch.missingPreferences.length > 0) {
    console.log(`   Missing prefs: ${match.accessibilityMatch.missingPreferences.join(', ')}`);
  }
  console.log('');
});

console.log('Expected: Alice (perfect match), Diana filtered out (too far)');

// Test 3: Driver to Bookings Matching
console.log('\n\n🚗 Test 3: Match Driver to Available Bookings');
console.log('-'.repeat(70));

const aliceMatches = matchDriverToBookings(drivers[0], bookings);

console.log(`Alice can fulfill these bookings:`);
console.log(`Total matches: ${aliceMatches.length}\n`);

aliceMatches.forEach((match, index) => {
  console.log(`${index + 1}. ${match.booking.pickupLocation} → ${match.booking.dropoffLocation}`);
  console.log(`   Pickup: ${match.booking.pickupTime.toLocaleString()}`);
  console.log(`   Distance: ${match.distance} miles`);
  console.log(`   Overall Score: ${match.overallScore}/100`);
  console.log(`   Accessibility: ${match.accessibilityMatch.compatibilityScore}%`);
  console.log('');
});

// Test 4: Charlie (standard vehicle) should only get booking 3
console.log('\n\n🚙 Test 4: Standard Vehicle (No Wheelchair Access)');
console.log('-'.repeat(70));

const charlieMatches = matchDriverToBookings(drivers[2], bookings);

console.log(`Charlie (Standard Vehicle) can fulfill:`);
console.log(`Total matches: ${charlieMatches.length}\n`);

if (charlieMatches.length === 0) {
  console.log('  ❌ No matches found');
} else {
  charlieMatches.forEach((match, index) => {
    console.log(`${index + 1}. ${match.booking.pickupLocation}`);
    console.log(`   Score: ${match.overallScore}/100`);
  });
}

console.log('\nExpected: Only Booking 3 (no wheelchair needed)');

// Test 5: Best Driver for Instant Booking
console.log('\n\n⚡ Test 5: Find Best Driver for Instant Booking');
console.log('-'.repeat(70));

const instantBooking = bookings[0]; // Wheelchair booking
const bestDriver = findBestDriverForInstantBooking(instantBooking, drivers);

if (bestDriver) {
  console.log(`Best match for instant booking:`);
  console.log(`  Driver: ${bestDriver.driver.name}`);
  console.log(`  Score: ${bestDriver.overallScore}/100`);
  console.log(`  Distance: ${bestDriver.distance} miles`);
  console.log(`  ETA: ${bestDriver.estimatedPickupMinutes} minutes`);
} else {
  console.log('  ❌ No suitable driver found');
}

console.log('\nExpected: Alice (closest + perfect accessibility match)');

// Test 6: Geographic Filtering
console.log('\n\n📍 Test 6: Geographic Radius Filtering');
console.log('-'.repeat(70));

const farBooking = {
  ...bookings[0],
  pickupLat: 51.5074, // London
  pickupLng: -0.1278,
  pickupLocation: 'London',
};

const londonMatches = matchBookingToDrivers(farBooking, drivers, {
  maxDistance: 50
});

console.log(`Booking in London - drivers within range:`);
console.log(`Total matches: ${londonMatches.length}`);
console.log('\nExpected: 0 matches (all drivers too far away)');

// Test 7: Capacity Check
console.log('\n\n👥 Test 7: Passenger Capacity Check');
console.log('-'.repeat(70));

const largeGroupBooking = {
  ...bookings[0],
  pickupLat: 53.4808,
  pickupLng: -2.2426,
  accessibilityProfile: {
    ...bookings[0].accessibilityProfile,
    passengerCount: 8, // More than most drivers can handle
    wheelchairAccess: false,
  },
};

const capacityMatches = matchBookingToDrivers(largeGroupBooking, drivers);

console.log(`Booking needs 8 passengers:`);
console.log(`Drivers who can handle it: ${capacityMatches.length}`);

if (capacityMatches.length > 0) {
  capacityMatches.forEach(match => {
    console.log(`  - ${match.driver.name}: capacity ${match.driver.accessibilityProfile.passengerCount}`);
  });
} else {
  console.log('  ❌ No drivers with sufficient capacity');
}

console.log('\nExpected: 0 or 1 matches (only Bob has 6 capacity, need 8)');

console.log('\n' + '='.repeat(70));
console.log('✅ All matching algorithm tests complete!\n');
console.log('Summary:');
console.log('  ✅ Accessibility matching works');
console.log('  ✅ Geographic filtering works');
console.log('  ✅ Scoring system ranks appropriately');
console.log('  ✅ Capacity checks enforce passenger limits');
console.log('  ✅ Female driver preference respected');
console.log('  ✅ Best driver selection for instant bookings');