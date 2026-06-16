import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // ramp up to 20 users
    { duration: '1m', target: 50 },    // ramp up to 50 users
    { duration: '30s', target: 50 },   // stay at 50 users
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% under 1 second under stress
    http_req_failed: ['rate<0.05'],    // less than 5% errors under stress
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';

export function setup() {
  const res = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email: `k6-stress-${Date.now()}@test.com`,
      password: 'password123',
      name: 'K6 Stress Test',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const body = JSON.parse(res.body);
  return { token: body.access_token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Auth endpoint
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'k6-stress@test.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(loginRes, { 'login responds': (r) => r.status === 200 || r.status === 401 });

  // Applications list
  const listRes = http.get(`${BASE_URL}/applications`, { headers });
  check(listRes, { 'list applications': (r) => r.status === 200 });

  sleep(0.5);
}