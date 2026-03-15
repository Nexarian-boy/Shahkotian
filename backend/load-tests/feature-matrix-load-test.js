import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'Test@12345';
const TEST_USER_COUNT = Number(__ENV.TEST_USER_COUNT || 500);
const LAT = Number(__ENV.TEST_LAT || 31.5709);
const LNG = Number(__ENV.TEST_LNG || 73.4853);

const endpointSuccess = new Rate('endpoint_success');
const writeSuccess = new Rate('write_success');
const skippedWrites = new Counter('skipped_writes');

export const options = {
  scenarios: {
    matrix_mix: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.MATRIX_RPS || 25),
      timeUnit: '1s',
      duration: __ENV.MATRIX_DURATION || '5m',
      preAllocatedVUs: Number(__ENV.MATRIX_PRE_VUS || 120),
      maxVUs: Number(__ENV.MATRIX_MAX_VUS || 600),
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.08'],
    endpoint_success: ['rate>0.85'],
    write_success: ['rate>0.75'],
  },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function asJson(body) {
  try {
    return JSON.parse(body);
  } catch (_) {
    return null;
  }
}

function randomUser() {
  const i = randomInt(1, TEST_USER_COUNT);
  return {
    email: `testuser${i}@${__ENV.TEST_USER_EMAIL_DOMAIN || 'shahkot-test.com'}`,
    password: TEST_USER_PASSWORD,
  };
}

function login() {
  const u = randomUser();
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: u.email,
      password: u.password,
      latitude: LAT,
      longitude: LNG,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = res.status === 200;
  if (!ok) return null;

  const data = asJson(res.body);
  if (!data?.token) return null;

  return {
    token: data.token,
    userId: data.user?.id,
  };
}

function runReadChecks(headers) {
  const checks = [
    () => http.get(`${BASE_URL}/listings?limit=10`, { headers }),
    () => http.get(`${BASE_URL}/news?limit=10`, { headers }),
    () => http.get(`${BASE_URL}/jobs?limit=10`, { headers }),
    () => http.get(`${BASE_URL}/notifications?page=1`, { headers }),
    () => http.get(`${BASE_URL}/chat/messages?page=1&limit=20`, { headers }),
    () => http.get(`${BASE_URL}/bazar/chat/messages?bazarId=global&page=1`, { headers }),
    () => http.get(`${BASE_URL}/doctors`, { headers }),
    () => http.get(`${BASE_URL}/restaurants`, { headers }),
    () => http.get(`${BASE_URL}/cloth-brands`, { headers }),
    () => http.get(`${BASE_URL}/blood/donors`, { headers }),
  ];

  const selected = checks[randomInt(0, checks.length - 1)]();
  const ok = check(selected, {
    'matrix read status 200': (r) => r.status === 200,
  });
  endpointSuccess.add(ok);
}

function runWriteChecks(headers) {
  const actions = [
    () => http.post(
      `${BASE_URL}/chat/messages`,
      JSON.stringify({ text: `matrix msg ${Date.now()}`, images: [], videos: [] }),
      { headers }
    ),
    () => http.post(
      `${BASE_URL}/chat/report`,
      JSON.stringify({ messageId: '00000000-0000-0000-0000-000000000000', reason: 'load-test' }),
      { headers }
    ),
  ];

  const res = actions[randomInt(0, actions.length - 1)]();

  const ok = check(res, {
    'matrix write accepted': (r) => [200, 201, 400, 404].includes(r.status),
  });
  // In this matrix script, 400/404 can be expected for synthetic payloads.
  writeSuccess.add(ok);
}

export default function () {
  const auth = login();
  if (!auth) {
    endpointSuccess.add(false);
    sleep(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth.token}`,
  };

  runReadChecks(headers);

  // 40% of iterations attempt writes.
  if (Math.random() < 0.4) {
    runWriteChecks(headers);
  } else {
    skippedWrites.add(1);
  }

  sleep(Math.random() * 1.2);
}
