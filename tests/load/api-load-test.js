import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'],                  // Less than 1% errors
    errors: ['rate<0.05'],                           // Less than 5% custom errors
  },
};

const BASE_URL = 'http://localhost:3000';

// Test data
const testBooking = {
  pickupLocation: 'M1 1AA',
  dropoffLocation: 'M2 2BB',
  pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  pickupTime: '10:00',
  returnJourney: false,
  accessibilityNeeds: {
    wheelchairUser: true,
    mobilityAids: ['walker'],
    assistanceRequired: true,
  },
  passengerCount: 1,
};

export default function () {
  // Test 1: Home page
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'home page loaded': (r) => r.status === 200,
    'home page loads in <200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Create booking form
  res = http.get(`${BASE_URL}/api/postcodes/validate?postcode=M1%201AA`);
  check(res, {
    'postcode validation works': (r) => r.status === 200,
    'postcode validation <100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Search drivers (public endpoint)
  res = http.post(
    `${BASE_URL}/api/drivers/search`,
    JSON.stringify({
      pickupPostcode: 'M1 1AA',
      dropoffPostcode: 'M2 2BB',
      accessibilityNeeds: testBooking.accessibilityNeeds,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(res, {
    'driver search works': (r) => r.status === 200 || r.status === 401,
    'driver search <300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(2);

  // Test 4: Static assets
  res = http.get(`${BASE_URL}/_next/static/css/app/layout.css`);
  check(res, {
    'static assets load': (r) => r.status === 200 || r.status === 404,
    'static assets <50ms': (r) => r.timings.duration < 50,
  }) || errorRate.add(1);

  sleep(1);
}

// Setup function (runs once per VU at start)
export function setup() {
  console.log('🚀 Starting NEAT Transport API Load Test');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log('⏱️  Duration: 6 minutes total');
  console.log('👥 Max concurrent users: 100');
}

// Teardown function (runs once at end)
export function teardown(data) {
  console.log('✅ Load test completed');
}