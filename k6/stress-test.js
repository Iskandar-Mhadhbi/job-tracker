import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
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

  const listRes = http.get(`${BASE_URL}/applications`, { headers });
  check(listRes, { 'list applications': (r) => r.status === 200 });

  const statsRes = http.get(`${BASE_URL}/applications/stats`, { headers });
  check(statsRes, { 'get stats': (r) => r.status === 200 });

  const createRes = http.post(
    `${BASE_URL}/applications`,
    JSON.stringify({
      company_name: 'Stress Test Co',
      role_title: 'Load Test Engineer',
      applied_date: new Date().toISOString().split('T')[0],
      status: 'applied',
    }),
    { headers },
  );
  check(createRes, { 'create application': (r) => r.status === 201 });

  sleep(0.5);
}