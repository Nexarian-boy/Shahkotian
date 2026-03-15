require('dotenv').config();
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'https://lionfish-app-tkr7y.ondigitalocean.app/api';
const ADMIN_TOKEN = (process.env.ADMIN_TOKEN || '').replace(/\s+/g, '').trim();

function getRequestOptions(pathname) {
  const url = new URL(BASE_URL);
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: `${url.pathname.replace(/\/$/, '')}${pathname}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
  };
}

async function request(pathname) {
  if (!ADMIN_TOKEN) {
    throw new Error('Missing ADMIN_TOKEN in environment');
  }

  const options = getRequestOptions(pathname);
  const transport = options.protocol === 'https:' ? https : require('http');

  return new Promise((resolve, reject) => {
    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (_) {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testDbRotation() {
  console.log('\nTesting Database Rotation (via deployed API)...\n');

  const res = await request('/db-status');
  if (res.status !== 200) {
    console.log('Failed:', res.body);
    return;
  }

  console.log('Database Status:');
  res.body.databases?.forEach((db, i) => {
    const isActive = i === res.body.activeDatabase;
    console.log(`  DB#${i}: ${db.sizeMB || 0}MB ${isActive ? '<- ACTIVE (writes go here)' : '(read only)'}`);
  });

  console.log(`\nActive DB: #${res.body.activeDatabase}`);
  console.log(`Total DBs: ${res.body.totalDatabases}\n`);
}

testDbRotation()
  .catch((error) => {
    console.error('Failed:', error.message);
    process.exitCode = 1;
  });
