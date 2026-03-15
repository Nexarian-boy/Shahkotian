import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'Test@12345';
const TEST_USER_COUNT = Number(__ENV.TEST_USER_COUNT || 500);
const LAT = Number(__ENV.TEST_LAT || 31.5709);
const LNG = Number(__ENV.TEST_LNG || 73.4853);

const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || '';

const loginSuccess = new Rate('login_success');
const listingsLoad = new Rate('listings_load');
const chatSend = new Rate('chat_send');
const dbRotationChecks = new Counter('db_rotation_checks');
const adminChecks = new Counter('admin_checks');
const apiErrors = new Counter('api_errors');
const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    ramp_up_500_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '30s', target: 300 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
    login_success: ['rate>0.90'],
    listings_load: ['rate>0.85'],
    chat_send: ['rate>0.80'],
  },
};

function getRandomTestUser() {
  const i = Math.floor(Math.random() * TEST_USER_COUNT) + 1;
  return {
    email: `testuser${i}@${__ENV.TEST_USER_EMAIL_DOMAIN || 'shahkot-test.com'}`,
    password: TEST_USER_PASSWORD,
  };
}

function asJson(body) {
  try {
    return JSON.parse(body);
  } catch (_) {
    return null;
  }
}

function maybeAdminToken() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return null;

  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      latitude: LAT,
      longitude: LNG,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const ok = res.status === 200;
  if (!ok) return null;
  const data = asJson(res.body);
  return data?.token || null;
}

export default function () {
  const user = getRandomTestUser();

  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: user.email,
      password: user.password,
      latitude: LAT,
      longitude: LNG,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginOk = check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login contains token': (r) => {
      const data = asJson(r.body);
      return !!data?.token;
    },
  });

  loginSuccess.add(loginOk);
  responseTime.add(loginRes.timings.duration);

  if (!loginOk) {
    apiErrors.add(1);
    sleep(1);
    return;
  }

  const loginData = asJson(loginRes.body) || {};
  const token = loginData.token;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  sleep(0.2);

  const listingsRes = http.get(`${BASE_URL}/listings?limit=10`, { headers });
  const listingsOk = check(listingsRes, {
    'listings status 200': (r) => r.status === 200,
    'listings has array': (r) => {
      const data = asJson(r.body);
      return Array.isArray(data?.listings);
    },
  });
  listingsLoad.add(listingsOk);
  responseTime.add(listingsRes.timings.duration);

  sleep(0.2);

  const newsRes = http.get(`${BASE_URL}/news?limit=5`, { headers });
  check(newsRes, { 'news status 200': (r) => r.status === 200 });
  responseTime.add(newsRes.timings.duration);

  const jobsRes = http.get(`${BASE_URL}/jobs?limit=5`, { headers });
  check(jobsRes, { 'jobs status 200': (r) => r.status === 200 });
  responseTime.add(jobsRes.timings.duration);

  const notifRes = http.get(`${BASE_URL}/notifications?page=1`, { headers });
  check(notifRes, { 'notifications status 200': (r) => r.status === 200 });
  responseTime.add(notifRes.timings.duration);

  const chatReadRes = http.get(`${BASE_URL}/chat/messages?page=1&limit=20`, { headers });
  check(chatReadRes, { 'chat read status 200': (r) => r.status === 200 });
  responseTime.add(chatReadRes.timings.duration);

  const bazarReadRes = http.get(`${BASE_URL}/bazar/chat/messages?bazarId=global&page=1`, { headers });
  check(bazarReadRes, { 'bazar read status 200': (r) => r.status === 200 });
  responseTime.add(bazarReadRes.timings.duration);

  const msgRes = http.post(
    `${BASE_URL}/chat/messages`,
    JSON.stringify({
      text: `Load test message ${Date.now()}`,
      images: [],
      videos: [],
    }),
    { headers }
  );
  const msgOk = check(msgRes, {
    'chat send status 201': (r) => r.status === 201,
  });
  chatSend.add(msgOk);
  responseTime.add(msgRes.timings.duration);

  if (!msgOk) {
    apiErrors.add(1);
  }

  // Optional admin-only checks to validate DB/cloudinary rotation endpoints.
  const adminToken = maybeAdminToken();
  if (adminToken) {
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    const dbStatusRes = http.get(`${BASE_URL}/db-status`, { headers: adminHeaders });
    const dbOk = check(dbStatusRes, { 'db-status 200': (r) => r.status === 200 });
    if (dbOk) dbRotationChecks.add(1);

    const cloudStatusRes = http.get(`${BASE_URL}/cloudinary-status`, { headers: adminHeaders });
    const cloudOk = check(cloudStatusRes, { 'cloudinary-status 200': (r) => r.status === 200 });
    if (cloudOk) adminChecks.add(1);

    responseTime.add(dbStatusRes.timings.duration);
    responseTime.add(cloudStatusRes.timings.duration);
  }

  sleep(0.5);
}

function pct(rateMetric) {
  return ((rateMetric?.values?.rate || 0) * 100).toFixed(2);
}

function num(metric, key = 'count') {
  return metric?.values?.[key] || 0;
}

export function handleSummary(data) {
  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    metrics: {
      totalRequests: num(data.metrics.http_reqs),
      failedRate: failed?.values?.rate || 0,
      avgMs: duration?.values?.avg || 0,
      p95Ms: duration?.values?.['p(95)'] || 0,
      p99Ms: duration?.values?.['p(99)'] || 0,
      maxMs: duration?.values?.max || 0,
      loginSuccessRate: data.metrics.login_success?.values?.rate || 0,
      listingsLoadRate: data.metrics.listings_load?.values?.rate || 0,
      chatSendRate: data.metrics.chat_send?.values?.rate || 0,
      dbRotationChecks: num(data.metrics.db_rotation_checks),
      adminChecks: num(data.metrics.admin_checks),
      apiErrors: num(data.metrics.api_errors),
    },
  };

  const table = `\n=== Shahkot Main Load Test Summary ===\n`
    + `Requests: ${num(data.metrics.http_reqs)}\n`
    + `Failed: ${(failed?.values?.rate * 100).toFixed(2)}%\n`
    + `Avg: ${(duration?.values?.avg || 0).toFixed(0)}ms\n`
    + `P95: ${(duration?.values?.['p(95)'] || 0).toFixed(0)}ms\n`
    + `P99: ${(duration?.values?.['p(99)'] || 0).toFixed(0)}ms\n`
    + `Max: ${(duration?.values?.max || 0).toFixed(0)}ms\n`
    + `Login success: ${pct(data.metrics.login_success)}%\n`
    + `Listings success: ${pct(data.metrics.listings_load)}%\n`
    + `Chat send success: ${pct(data.metrics.chat_send)}%\n`
    + `DB checks: ${num(data.metrics.db_rotation_checks)}\n`
    + `Cloud/Admin checks: ${num(data.metrics.admin_checks)}\n`
    + `API errors: ${num(data.metrics.api_errors)}\n`;

  return {
    'load-tests/main-load-test-results.json': JSON.stringify(report, null, 2),
    stdout: table,
  };
}
