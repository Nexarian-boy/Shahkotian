require('dotenv').config();

async function testCloudinaryRotation() {
  console.log('\nTesting Cloudinary Rotation System...\n');

  const cloudinaryModule = require('../../src/config/cloudinary');
  const manager = cloudinaryModule.manager;

  if (!manager) {
    console.log('Cloudinary manager not found.');
    return;
  }

  const statuses = await manager.getAllStatus();
  console.log('Cloudinary account status:');
  statuses.forEach((acc) => {
    const marker = acc.isActive ? '<- ACTIVE' : '';
    console.log(
      `  Account#${acc.index} (${acc.cloud_name}): ${acc.credits || 0}/${acc.creditsLimit || 25} credits ${marker}`.trim()
    );
  });

  console.log(`\nActive account index: ${manager.activeIndex}`);
  console.log(`Rotate threshold: ${process.env.CLOUDINARY_CREDITS_LIMIT || '20'} credits\n`);
}

testCloudinaryRotation().catch((error) => {
  console.error('Cloudinary rotation test failed:', error);
  process.exitCode = 1;
});
