const { exec } = require('child_process');
require('dotenv').config();

const urlsStr = process.env.DATABASE_URLS;
if (!urlsStr) {
  console.error('DATABASE_URLS is not defined in .env');
  process.exit(1);
}

const urls = urlsStr.split(',').map(u => u.trim()).filter(Boolean);
console.log(`Found ${urls.length} databases in .env. Starting schema sync (async)...`);

let successCount = 0;
let failCount = 0;

async function syncDatabase(url, i) {
  return new Promise((resolve) => {
    console.log(`\n⏳ Pushing schema to Database ${i + 1} of ${urls.length}...`);
    exec('npx prisma db push --accept-data-loss --skip-generate', {
      env: { ...process.env, DATABASE_URL: url }
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error pushing to Database ${i + 1}:`, error.message);
        console.error('--- STDERR ---');
        console.error(stderr);
        console.error('--- STDOUT ---');
        console.error(stdout);
        failCount++;
      } else {
        console.log(`✅ Database ${i + 1} sync successful.`);
        successCount++;
      }
      resolve();
    });
  });
}

async function runAll() {
  for (let i = 0; i < urls.length; i++) {
    await syncDatabase(urls[i], i);
  }
  console.log(`\n🎉 Sync complete! ${successCount} successful, ${failCount} failed.`);
}

runAll();
