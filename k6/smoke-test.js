import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,           // 5 virtual users
  duration: '30s',  // run for 30 seconds
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // less than 1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';

export function setup() {
  // Register a test user and return the token
  const res = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email: `k6-smoke-${Date.now()}@test.com`,
      password: 'password123',
      name: 'K6 Smoke Test',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(res, { 'registered successfully': (r) => r.status === 200 || r.status === 201 });

  const body = JSON.parse(res.body);
  return { token: body.access_token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Test GET /applications
  const listRes = http.get(`${BASE_URL}/applications`, { headers });
  check(listRes, { 'list applications 200': (r) => r.status === 200 });

  // Test GET /applications/stats
  const statsRes = http.get(`${BASE_URL}/applications/stats`, { headers });
  check(statsRes, { 'get stats 200': (r) => r.status === 200 });

  // Test POST /applications
  const createRes = http.post(
    `${BASE_URL}/applications`,
    JSON.stringify({
      company_name: 'K6 Test Company',
      role_title: 'Test Engineer',
      applied_date: new Date().toISOString().split('T')[0],
      status: 'applied',
    }),
    { headers },
  );
  check(createRes, { 'create application 201': (r) => r.status === 201 });

  sleep(1);
}