//lib/matching/tests/distancecalculator.test.js
/**
 * Test file for distance calculator
 * Run this to verify calculations are working correctly
 * 
 * To run: node lib/matching/__tests__/distanceCalculator.test.js
 */

import {
  calculateDistance,
  isWithinRadius,
  formatDistance,
  estimateDriveTime,
  formatDriveTime,
  findDriversInRadius,
  calculateTripDistance
} from '../distanceCalculator.js';

// Real UK postcodes with coordinates
const LOCATIONS = {
  SK3_0AA: { name: 'Stockport', lat: 53.4084, lng: -2.1487 },
  M1_1AA: { name: 'Manchester City Centre', lat: 53.4808, lng: -2.2426 },
  M60_1NW: { name: 'Manchester', lat: 53.4831, lng: -2.2444 },
  LONDON: { name: 'London', lat: 51.5074, lng: -0.1278 },
  BIRMINGHAM: { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
};

console.log('🧪 Testing Distance Calculator\n');
console.log('=' .repeat(60));

// Test 1: Basic distance calculation
console.log('\n📏 Test 1: Distance Calculations');
console.log('-'.repeat(60));

const distance1 = calculateDistance(
  LOCATIONS.SK3_0AA.lat, LOCATIONS.SK3_0AA.lng,
  LOCATIONS.M1_1AA.lat, LOCATIONS.M1_1AA.lng
);
console.log(`${LOCATIONS.SK3_0AA.name} → ${LOCATIONS.M1_1AA.name}`);
console.log(`  Raw: ${distance1.toFixed(2)} miles`);
console.log(`  Formatted: ${formatDistance(distance1)}`);
console.log(`  ✅ Expected: ~4.7 miles`);

const distance2 = calculateDistance(
  LOCATIONS.M1_1AA.lat, LOCATIONS.M1_1AA.lng,
  LOCATIONS.M60_1NW.lat, LOCATIONS.M60_1NW.lng
);
console.log(`\n${LOCATIONS.M1_1AA.name} → ${LOCATIONS.M60_1NW.name}`);
console.log(`  Raw: ${distance2.toFixed(2)} miles`);
console.log(`  Formatted: ${formatDistance(distance2)}`);
console.log(`  ✅ Expected: ~0.1 miles (very close)`);

const distance3 = calculateDistance(
  LOCATIONS.SK3_0AA.lat, LOCATIONS.SK3_0AA.lng,
  LOCATIONS.BIRMINGHAM.lat, LOCATIONS.BIRMINGHAM.lng
);
console.log(`\n${LOCATIONS.SK3_0AA.name} → ${LOCATIONS.BIRMINGHAM.name}`);
console.log(`  Raw: ${distance3.toFixed(2)} miles`);
console.log(`  Formatted: ${formatDistance(distance3)}`);
console.log(`  ✅ Expected: ~60-70 miles`);

// Test 2: Within radius checks
console.log('\n\n🎯 Test 2: Within Radius Checks');
console.log('-'.repeat(60));

const driverLocation = LOCATIONS.SK3_0AA;
const driverRadius = 10; // 10 mile radius

console.log(`Driver Base: ${driverLocation.name}`);
console.log(`Service Radius: ${driverRadius} miles\n`);

const test2a = isWithinRadius(
  driverLocation.lat, driverLocation.lng, driverRadius,
  LOCATIONS.M1_1AA.lat, LOCATIONS.M1_1AA.lng
);
console.log(`Pickup at ${LOCATIONS.M1_1AA.name} (${distance1.toFixed(1)}mi away)`);
console.log(`  Within ${driverRadius}mi radius? ${test2a ? '✅ YES' : '❌ NO'}`);
console.log(`  Expected: ✅ YES (4.7 < 10)`);

const test2b = isWithinRadius(
  driverLocation.lat, driverLocation.lng, 5, // 5 mile radius
  LOCATIONS.M1_1AA.lat, LOCATIONS.M1_1AA.lng
);
console.log(`\nPickup at ${LOCATIONS.M1_1AA.name} with 5mi radius`);
console.log(`  Within 5mi radius? ${test2b ? '✅ YES' : '❌ NO'}`);
console.log(`  Expected: ❌ NO (4.7 > 5)`);

const test2c = isWithinRadius(
  driverLocation.lat, driverLocation.lng, driverRadius,
  LOCATIONS.BIRMINGHAM.lat, LOCATIONS.BIRMINGHAM.lng
);
console.log(`\nPickup at ${LOCATIONS.BIRMINGHAM.name} (${distance3.toFixed(1)}mi away)`);
console.log(`  Within ${driverRadius}mi radius? ${test2c ? '✅ YES' : '❌ NO'}`);
console.log(`  Expected: ❌ NO (${distance3.toFixed(1)} > 10)`);

// Test 3: Drive time estimates
console.log('\n\n⏱️  Test 3: Drive Time Estimates');
console.log('-'.repeat(60));

const times = [
  { distance: 2.5, desc: 'Short trip' },
  { distance: 10, desc: 'Medium trip' },
  { distance: 30, desc: 'Long trip' },
  { distance: 45, desc: 'Very long trip' },
];

times.forEach(({ distance, desc }) => {
  const minutes = estimateDriveTime(distance);
  console.log(`${desc}: ${formatDistance(distance)}`);
  console.log(`  Time: ${formatDriveTime(minutes)}`);
  console.log(`  (@ 30mph average)`);
});

// Test 4: Multiple drivers
console.log('\n\n👥 Test 4: Finding Drivers in Radius');
console.log('-'.repeat(60));

const testDrivers = [
  {
    id: 1,
    name: 'Driver A',
    baseLat: LOCATIONS.SK3_0AA.lat,
    baseLng: LOCATIONS.SK3_0AA.lng,
    radiusMiles: 10
  },
  {
    id: 2,
    name: 'Driver B',
    baseLat: LOCATIONS.M60_1NW.lat,
    baseLng: LOCATIONS.M60_1NW.lng,
    radiusMiles: 5
  },
  {
    id: 3,
    name: 'Driver C',
    baseLat: LOCATIONS.BIRMINGHAM.lat,
    baseLng: LOCATIONS.BIRMINGHAM.lng,
    radiusMiles: 15
  },
];

const pickupLat = LOCATIONS.M1_1AA.lat;
const pickupLng = LOCATIONS.M1_1AA.lng;

console.log(`Pickup Location: ${LOCATIONS.M1_1AA.name}`);
console.log(`\nAvailable Drivers:`);

const matches = findDriversInRadius(testDrivers, pickupLat, pickupLng);

if (matches.length === 0) {
  console.log('  ❌ No drivers found in range');
} else {
  matches.forEach(({ driver, distance }) => {
    console.log(`\n  ✅ ${driver.name}`);
    console.log(`     Distance: ${formatDistance(distance)}`);
    console.log(`     Service Radius: ${driver.radiusMiles} miles`);
    console.log(`     Drive Time: ${formatDriveTime(estimateDriveTime(distance))}`);
  });
}

console.log(`\n  Expected: Driver A (✅) and Driver B (✅)`);
console.log(`            Driver C too far (❌)`);

// Test 5: Trip distance (pickup to dropoff)
console.log('\n\n🚗 Test 5: Trip Distance Calculation');
console.log('-'.repeat(60));

const tripDistance = calculateTripDistance(
  LOCATIONS.SK3_0AA.lat, LOCATIONS.SK3_0AA.lng,
  LOCATIONS.M1_1AA.lat, LOCATIONS.M1_1AA.lng
);

console.log(`Pickup: ${LOCATIONS.SK3_0AA.name}`);
console.log(`Dropoff: ${LOCATIONS.M1_1AA.name}`);
console.log(`Total Trip Distance: ${formatDistance(tripDistance)}`);
console.log(`Estimated Duration: ${formatDriveTime(estimateDriveTime(tripDistance))}`);

console.log('\n' + '='.repeat(60));
console.log('✅ All tests complete!\n');