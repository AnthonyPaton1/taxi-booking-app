// tests/quick-api-test.js
// Simple API test script that doesn't require Playwright or k6
// Run with: node tests/quick-api-test.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testUsers = {
  admin: { email: 'admin@sunnycarehome.co.uk', password: 'Password123!' },
  coordinator: { email: 'coordinator@sunnycarehome.co.uk', password: 'Password123!' },
  driver: { email: 'driver1@neatransport.co.uk', password: 'Password123!' },
  individual: { email: 'passenger1@example.com', password: 'Password123!' },
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.text();
  
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch {
    jsonData = data;
  }

  return {
    status: response.status,
    headers: response.headers,
    data: jsonData,
  };
}

async function login(email, password) {
  try {
    const res = await makeRequest('/api/auth/callback/credentials', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 200 || res.status === 302) {
      const cookies = res.headers.get('set-cookie');
      return { success: true, cookies };
    }

    return { success: false, error: `Login failed with status ${res.status}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function logTest(name, passed, details = '') {
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} ${name}`);
  if (details) console.log(`   ${details}`);
  
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...\n');

  // Test 1: Valid login
  const adminLogin = await login(testUsers.admin.email, testUsers.admin.password);
  logTest('Admin login', adminLogin.success, adminLogin.error || 'Login successful');

  // Test 2: Invalid credentials
  const invalidLogin = await login('wrong@example.com', 'wrongpassword');
  logTest('Invalid credentials rejected', !invalidLogin.success, 'Should fail with wrong credentials');

  // Test 3: All user roles can login
  for (const [role, user] of Object.entries(testUsers)) {
    const result = await login(user.email, user.password);
    logTest(`${role} login`, result.success, result.error || `${role} can authenticate`);
  }
}

async function testBookingEndpoints() {
  console.log('\n📋 Testing Booking Endpoints...\n');

  // Login as coordinator
  const loginResult = await login(testUsers.coordinator.email, testUsers.coordinator.password);
  if (!loginResult.success) {
    logTest('Booking tests', false, 'Could not login to test bookings');
    return;
  }

  // Test: Get bookings
  try {
    const res = await makeRequest('/api/bookings', {
      method: 'GET',
      headers: {
        'Cookie': loginResult.cookies,
      },
    });

    logTest('Get bookings', res.status === 200, `Status: ${res.status}`);
    
    if (res.status === 200 && Array.isArray(res.data)) {
      logTest('Bookings data structure', true, `Found ${res.data.length} bookings`);
    }
  } catch (error) {
    logTest('Get bookings', false, error.message);
  }

  // Test: Create booking
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const booking = {
      pickupLocation: 'Test Location',
      pickupPostcode: 'SK4 1AA',
      dropoffLocation: 'Test Destination', 
      dropoffPostcode: 'M13 9WL',
      pickupDateTime: tomorrow.toISOString(),
      passengerCount: 1,
      bookingType: 'ADVANCE',
      requiresWheelchair: true,
    };

    const res = await makeRequest('/api/bookings', {
      method: 'POST',
      headers: {
        'Cookie': loginResult.cookies,
      },
      body: JSON.stringify(booking),
    });

    logTest('Create booking', res.status === 200 || res.status === 201, `Status: ${res.status}`);
  } catch (error) {
    logTest('Create booking', false, error.message);
  }
}

async function testDriverEndpoints() {
  console.log('\n🚗 Testing Driver Endpoints...\n');

  // Login as driver
  const loginResult = await login(testUsers.driver.email, testUsers.driver.password);
  if (!loginResult.success) {
    logTest('Driver tests', false, 'Could not login as driver');
    return;
  }

  // Test: Get available bookings
  try {
    const res = await makeRequest('/api/driver/available-bookings', {
      method: 'GET',
      headers: {
        'Cookie': loginResult.cookies,
      },
    });

    logTest('Get available bookings', res.status === 200, `Status: ${res.status}`);
    
    if (res.status === 200 && Array.isArray(res.data)) {
      logTest('Available bookings data structure', true, `Found ${res.data.length} available bookings`);
    }
  } catch (error) {
    logTest('Get available bookings', false, error.message);
  }

  // Test: Get driver profile
  try {
    const res = await makeRequest('/api/driver/profile', {
      method: 'GET',
      headers: {
        'Cookie': loginResult.cookies,
      },
    });

    logTest('Get driver profile', res.status === 200, `Status: ${res.status}`);
  } catch (error) {
    logTest('Get driver profile', false, error.message);
  }
}

async function testPostcodeValidation() {
  console.log('\n📮 Testing Postcode Validation...\n');

  const validPostcodes = ['SK4 1AA', 'M1 5GD', 'M13 9WL', 'BL1 4QR'];
  const invalidPostcodes = ['INVALID', '12345', 'ABC', ''];

  for (const postcode of validPostcodes) {
    try {
      const res = await makeRequest(`/api/validate-postcode?postcode=${encodeURIComponent(postcode)}`);
      logTest(`Valid postcode: ${postcode}`, res.status === 200, `Status: ${res.status}`);
    } catch (error) {
      logTest(`Valid postcode: ${postcode}`, false, error.message);
    }
  }

  for (const postcode of invalidPostcodes) {
    try {
      const res = await makeRequest(`/api/validate-postcode?postcode=${encodeURIComponent(postcode)}`);
      logTest(`Invalid postcode rejected: ${postcode}`, res.status !== 200, `Status: ${res.status}`);
    } catch (error) {
      logTest(`Invalid postcode rejected: ${postcode}`, true, 'Correctly rejected');
    }
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting...\n');

  const testEmail = `ratelimit${Date.now()}@example.com`;
  
  // Make 6 rapid registration attempts
  const attempts = [];
  for (let i = 0; i < 6; i++) {
    attempts.push(
      makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Rate Limit Test',
          email: testEmail,
          phone: '07700900999',
          company: 'Test Co',
          type: 'CARE_HOME',
          role: 'ADMIN',
        }),
      })
    );
  }

  const results = await Promise.all(attempts);
  const rateLimited = results.some(r => r.status === 429);

  logTest('Rate limiting active', rateLimited, 
    rateLimited ? 'Rate limit triggered after multiple attempts' : 'Warning: No rate limit detected');
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...\n');

  // Login as coordinator
  const loginResult = await login(testUsers.coordinator.email, testUsers.coordinator.password);
  if (!loginResult.success) {
    logTest('Performance tests', false, 'Could not login');
    return;
  }

  // Test dashboard load time
  const start = Date.now();
  try {
    const res = await makeRequest('/api/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': loginResult.cookies,
      },
    });
    const duration = Date.now() - start;

    logTest('Dashboard load time', duration < 2000, `${duration}ms (target: <2000ms)`);
  } catch (error) {
    logTest('Dashboard load time', false, error.message);
  }

  // Test bookings list load time
  const bookingsStart = Date.now();
  try {
    const res = await makeRequest('/api/bookings', {
      method: 'GET',
      headers: {
        'Cookie': loginResult.cookies,
      },
    });
    const duration = Date.now() - bookingsStart;

    logTest('Bookings list load time', duration < 1000, `${duration}ms (target: <1000ms)`);
  } catch (error) {
    logTest('Bookings list load time', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting NEAT Transport API Tests...');
  console.log(`📍 Testing against: ${BASE_URL}\n`);

  await testAuthentication();
  await testBookingEndpoints();
  await testDriverEndpoints();
  await testPostcodeValidation();
  await testRateLimiting();
  await testPerformance();

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Pass Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50) + '\n');

  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.details}`);
    });
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});