const { pool } = require('../packages/shared/dist/index.js');

async function resetDB() {
  const conn = await pool.getConnection();
  
  try {
    console.log('Dropping all existing tables...');
    
    // Disable foreign key checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables
    const tables = await conn.query('SHOW TABLES');
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`Dropping table: ${tableName}`);
      await conn.query(`DROP TABLE IF EXISTS ${tableName}`);
    }
    
    // Re-enable foreign key checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✓ Database reset complete');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    conn.release();
    await pool.end();
  }
}

resetDB().catch(console.error);
