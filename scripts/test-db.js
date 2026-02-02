const { pool, healthCheck } = require('../packages/shared/dist/index.js');

async function test() {
  console.log('Testing database connection...');
  const healthy = await healthCheck();
  
  if (healthy) {
    console.log('✓ Database connection successful!');
    
    // Test query
    const conn = await pool.getConnection();
    const result = await conn.query('SHOW TABLES');
    console.log('Tables:', result.map(r => Object.values(r)[0]));
    conn.release();
  } else {
    console.log('✗ Database connection failed');
  }
  
  await pool.end();
}

test().catch(console.error);
