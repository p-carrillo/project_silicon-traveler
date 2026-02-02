import cron from 'node-cron';
import { pool } from '@silicon-traveler/shared';
import { createGeneratorJob } from './jobs/generator.job';
import { createPublisherJob } from './jobs/publisher.job';

// Randomize publisher time between 18:00 and 20:00
function getRandomPublishTime(): string {
  const hour = 18 + Math.floor(Math.random() * 3); // 18, 19, or 20
  const minute = Math.floor(Math.random() * 60);
  return `${minute} ${hour} * * *`; // minute hour * * *
}

async function main() {
  console.log('🚀 Silicon Traveler Scheduler starting...\n');

  const generatorJob = createGeneratorJob();
  const publisherJob = createPublisherJob();

  // Generator: Every 6 hours (0, 6, 12, 18)
  console.log('📅 Scheduling Generator job: Every 6 hours (00:00, 06:00, 12:00, 18:00)');
  cron.schedule('0 */6 * * *', async () => {
    await generatorJob.execute();
  });

  // Publisher: Daily at random time between 18:00-20:00
  const publishTime = getRandomPublishTime();
  console.log(`📅 Scheduling Publisher job: Daily at ${publishTime.split(' ')[1]}:${publishTime.split(' ')[0].padStart(2, '0')}`);
  cron.schedule(publishTime, async () => {
    await publisherJob.execute();
  });

  // Health check endpoint simulation (prints every hour)
  cron.schedule('0 * * * *', () => {
    console.log(`[Health] Scheduler alive at ${new Date().toISOString()}`);
  });

  console.log('\n✓ Scheduler running. Press Ctrl+C to stop.\n');

  // Run generator immediately on startup for testing
  console.log('🔄 Running initial generator job...\n');
  await generatorJob.execute();

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down scheduler...');
    await pool.end();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\nShutting down scheduler...');
    await pool.end();
    process.exit(0);
  });
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  await pool.end();
  process.exit(1);
});
