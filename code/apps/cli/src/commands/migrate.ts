#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { pool } from '@silicon-traveler/shared';
import chalk from 'chalk';

interface Migration {
  filename: string;
  version: string;
}

async function getMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = await fs.readdir(migrationsDir);
  
  return files
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(filename => ({
      filename,
      version: filename.split('_')[0],
    }));
}

async function getAppliedMigrations(): Promise<string[]> {
  try {
    const [rows] = await pool.execute<any[]>(
      'SELECT version FROM migrations ORDER BY version'
    );
    return rows.map((r: any) => r.version);
  } catch (error) {
    // migrations table doesn't exist yet, return empty
    return [];
  }
}

async function applyMigration(migration: Migration): Promise<void> {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const filepath = path.join(migrationsDir, migration.filename);
  const sql = await fs.readFile(filepath, 'utf-8');

  console.log(chalk.blue(`→ Applying ${migration.filename}...`));
  
  await pool.query(sql);
  
  // Record migration (skip for the migrations table creation itself)
  if (!migration.filename.includes('create_migrations_table')) {
    await pool.execute(
      'INSERT INTO migrations (version, description) VALUES (?, ?)',
      [migration.version, migration.filename.replace('.sql', '').replace(/^\d+_/, '')]
    );
  }
  
  console.log(chalk.green(`✓ Applied ${migration.filename}`));
}

export async function migrate(): Promise<void> {
  console.log(chalk.bold('\n🔄 Running migrations...\n'));

  try {
    const allMigrations = await getMigrations();
    const appliedVersions = await getAppliedMigrations();

    const pendingMigrations = allMigrations.filter(
      m => !appliedVersions.includes(m.version)
    );

    if (pendingMigrations.length === 0) {
      console.log(chalk.gray('No pending migrations.'));
      return;
    }

    console.log(chalk.yellow(`Found ${pendingMigrations.length} pending migration(s)\n`));

    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }

    console.log(chalk.green.bold('\n✓ All migrations applied successfully!\n'));
  } catch (error: any) {
    console.error(chalk.red.bold('\n✗ Migration failed:'), error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrate().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
