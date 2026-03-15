require('dotenv').config();
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'https://lionfish-app-tkr7y.ondigitalocean.app/api';
const ADMIN_TOKEN = (process.env.ADMIN_TOKEN || '').replace(/\s+/g, '').trim();

function getRequestOptions() {
  const url = new URL(BASE_URL);
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: `${url.pathname.replace(/\/$/, '')}/cloudinary-status`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
}

async function testCloudinaryRotation() {
  console.log('\nTesting Cloudinary Rotation (via deployed API)...\n');

  if (!ADMIN_TOKEN) {
    console.log('Missing ADMIN_TOKEN in environment.');
    return;
  }

  const options = getRequestOptions();
  const transport = options.protocol === 'https:' ? https : require('http');

  await new Promise((resolve, reject) => {
    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:', data);
          resolve();
          return;
        }

        const json = JSON.parse(data);
        console.log('Cloudinary Account Status:');
        json.accounts?.forEach((acc, i) => {
          const isActive = i === json.activeAccount;
          const creditsUsed = acc.credits_used ?? acc.credits ?? 0;
          console.log(`  Account#${i} (${acc.cloud_name}): ${creditsUsed} credits used ${isActive ? '<- ACTIVE' : ''}`);
        });
        console.log(`\nActive Account: #${json.activeAccount}`);
        console.log(`Rotate at: ${process.env.CLOUDINARY_CREDITS_LIMIT || 20} credits\n`);
        resolve();
      });
    });

    req.on('error', reject);
    req.end();
  });
}

testCloudinaryRotation().catch((error) => {
  console.error('Failed:', error.message);
  process.exitCode = 1;
});
