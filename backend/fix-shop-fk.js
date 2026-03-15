require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fix() {
  const client = await pool.connect();
  try {
    // Step 1 — Find the constraint name
    const result = await client.query(`
      SELECT tc.constraint_name 
      FROM information_schema.table_constraints tc 
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'Shop' 
        AND kcu.column_name = 'ownerId';
    `);

    if (result.rows.length === 0) {
      console.log('No FK constraint found on Shop.ownerId');
      return;
    }

    const constraintName = result.rows[0].constraint_name;
    console.log('Found constraint:', constraintName);

    // Step 2 — Drop old constraint
    await client.query(`ALTER TABLE "Shop" DROP CONSTRAINT "${constraintName}";`);
    console.log('Dropped old constraint');

    // Step 3 — Add new constraint with ON DELETE SET NULL
    await client.query(`
      ALTER TABLE "Shop" 
      ADD CONSTRAINT "${constraintName}" 
      FOREIGN KEY ("ownerId") 
      REFERENCES "User"("id") 
      ON DELETE SET NULL;
    `);
    console.log('✅ New constraint added with ON DELETE SET NULL');

    // Step 4 — Verify
    const verify = await client.query(`
      SELECT rc.delete_rule 
      FROM information_schema.referential_constraints rc
      WHERE rc.constraint_name = '${constraintName}';
    `);
    console.log('Delete rule:', verify.rows[0]?.delete_rule);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fix();
