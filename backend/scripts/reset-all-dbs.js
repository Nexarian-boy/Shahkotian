/**
 * reset-all-dbs.js
 * Drops & recreates all tables on EVERY database in DATABASE_URLS, then pushes the current schema.
 * Run from: e:\Shahkot\backend
 *   node scripts/reset-all-dbs.js
 */
require('dotenv').config();
const { execSync } = require('child_process');

const urlsRaw = process.env.DATABASE_URLS || process.env.DATABASE_URL || '';
const urls = urlsRaw.split(',').map(u => u.trim()).filter(Boolean);

if (urls.length === 0) {
  console.error('❌ No DATABASE_URLS found in .env');
  process.exit(1);
}

console.log(`\n🔁 Resetting ${urls.length} database(s)...\n`);

let failed = 0;
for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const masked = url.replace(/:([^@]+)@/, ':***@');
  console.log(`\n[${i + 1}/${urls.length}] Resetting DB: ${masked}`);
  try {
    execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'inherit',
    });
    console.log(`✅ DB #${i} reset successfully`);
  } catch (err) {
    console.error(`❌ DB #${i} failed: ${err.message}`);
    failed++;
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`✅ Done! ${urls.length - failed}/${urls.length} databases reset successfully.`);
if (failed > 0) console.log(`⚠️  ${failed} database(s) failed — check errors above.`);
