/**
 * Test Geographic Matching
 * Run this to verify postcode lookups and distance calculations work
 * Usage: node lib/matching/testGeographicMatching.js
 */

import {
  getPostcodeCoordinates,
  calculateDistanceBetweenPostcodes,
  isValidUKPostcode,
} from '../utils/postcodeUtils.js';

import {
  isWithinServiceArea,
  getGeographicallyEligibleDrivers,
  calculateProximityScore,
} from './geographicMatching.js';

async function runTests() {
  console.log('🧪 Testing Geographic Matching System\n');
  
  // Test 1: Validate postcodes
  console.log('Test 1: Postcode Validation');
  console.log('SK3 0AA valid?', isValidUKPostcode('SK3 0AA')); // true
  console.log('M1 1AA valid?', isValidUKPostcode('M1 1AA')); // true
  console.log('INVALID valid?', isValidUKPostcode('INVALID')); // false
  console.log('');
  
  // Test 2: Get coordinates
  console.log('Test 2: Postcode Coordinates');
  try {
    const stockportCoords = await getPostcodeCoordinates('SK3 0AA');
    console.log('SK3 0AA (Stockport):', stockportCoords);
    
    const manchesterCoords = await getPostcodeCoordinates('M1 1AA');
    console.log('M1 1AA (Manchester):', manchesterCoords);
  } catch (error) {
    console.error('Coordinate lookup failed:', error.message);
  }
  console.log('');
  
  // Test 3: Calculate distance
  console.log('Test 3: Distance Calculation');
  try {
    const distance = await calculateDistanceBetweenPostcodes('SK3 0AA', 'M1 1AA');
    console.log(`Distance from Stockport (SK3 0AA) to Manchester (M1 1AA): ${distance.toFixed(2)} miles`);
  } catch (error) {
    console.error('Distance calculation failed:', error.message);
  }
  console.log('');
  
  // Test 4: Service area check
  console.log('Test 4: Service Area Check');
  try {
    const driverBase = 'SK3 0AA'; // Stockport
    const driverRadius = 15; // 15 miles
    
    const booking1 = 'M1 1AA'; // Manchester ~7 miles
    const booking2 = 'L1 1AA'; // Liverpool ~35 miles
    
    const canReachManchester = await isWithinServiceArea(driverBase, driverRadius, booking1);
    const canReachLiverpool = await isWithinServiceArea(driverBase, driverRadius, booking2);
    
    console.log(`Driver in ${driverBase} with ${driverRadius} mile radius:`);
    console.log(`  Can reach ${booking1}? ${canReachManchester ? '✅' : '❌'}`);
    console.log(`  Can reach ${booking2}? ${canReachLiverpool ? '✅' : '❌'}`);
  } catch (error) {
    console.error('Service area check failed:', error.message);
  }
  console.log('');
  
  // Test 5: Mock driver matching
  console.log('Test 5: Driver Matching');
  try {
    const mockDrivers = [
      {
        id: '1',
        name: 'Driver A',
        basePostcode: 'SK3 0AA',
        baseLat: 53.4084,
        baseLng: -2.1487,
        travelRadius: 15,
      },
      {
        id: '2',
        name: 'Driver B',
        basePostcode: 'M20 2AA',
        baseLat: 53.4361,
        baseLng: -2.2331,
        travelRadius: 10,
      },
      {
        id: '3',
        name: 'Driver C',
        basePostcode: 'OL1 1AA',
        baseLat: 53.5444,
        baseLng: -2.1169,
        travelRadius: 5,
      },
    ];
    
    const mockBooking = {
      pickupPostcode: 'M1 1AA', // Manchester city center
    };
    
    const eligible = await getGeographicallyEligibleDrivers(mockBooking, mockDrivers);
    
    console.log(`Booking pickup: ${mockBooking.pickupPostcode}`);
    console.log(`Eligible drivers: ${eligible.length}/${mockDrivers.length}`);
    
    eligible.forEach(driver => {
      const score = calculateProximityScore(driver.distanceToPickup, driver.travelRadius);
      console.log(`  ${driver.name}: ${driver.distanceToPickup.toFixed(1)} miles away (score: ${score.toFixed(2)})`);
    });
  } catch (error) {
    console.error('Driver matching failed:', error.message);
  }
  
  console.log('\n✅ All tests complete!');
}

// Run tests
runTests().catch(console.error);