const fs = require('fs');
const path = require('path');
const { pool } = require('../packages/shared/dist/index.js');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  console.log(`Found ${files.length} migration files`);
  
  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    
    console.log(`\nApplying migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    const conn = await pool.getConnection();
    try {
      await conn.query(sql);
      console.log(`✓ Migration ${file} applied successfully`);
    } catch (error) {
      console.error(`✗ Error applying ${file}:`, error.message);
    } finally {
      conn.release();
    }
  }
  
  // Show tables
  console.log('\nCurrent tables:');
  const conn = await pool.getConnection();
  const result = await conn.query('SHOW TABLES');
  console.log(result.map(r => Object.values(r)[0]));
  conn.release();
  
  await pool.end();
}

runMigrations().catch(console.error);
