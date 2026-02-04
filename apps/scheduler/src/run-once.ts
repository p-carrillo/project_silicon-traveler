import { pool } from '@silicon-traveler/shared';
import { createGeneratorJob } from './jobs/generator.job';
import { createPublisherJob } from './jobs/publisher.job';
import { resolveRunOnceOptions } from './run-once-options';

const HELP_FLAGS = new Set(['-h', '--help']);

function formatUsage(): string {
  return [
    'Run the scheduler jobs once and exit.',
    '',
    'Usage:',
    '  pnpm --filter @silicon-traveler/scheduler run-once -- --job generator|publisher|all',
    '',
    'Options:',
    '  --job   Which job(s) to run. Default: generator',
    '',
    'Environment:',
    '  SCHEDULER_JOB=generator|publisher|all',
  ].join('\n');
}

async function runOnce(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.some((arg) => HELP_FLAGS.has(arg))) {
    console.log(formatUsage());
    return;
  }

  const resolved = resolveRunOnceOptions(args, process.env.SCHEDULER_JOB);
  if (!resolved.ok) {
    console.error(`[RunOnce] ${resolved.error}`);
    console.log(formatUsage());
    process.exitCode = 1;
    return;
  }

  const { job } = resolved.options;
  console.log(`[RunOnce] Starting "${job}" job(s)...`);

  const generatorJob = createGeneratorJob();
  const publisherJob = createPublisherJob();

  try {
    if (job === 'generator' || job === 'all') {
      await generatorJob.execute();
    }
    if (job === 'publisher' || job === 'all') {
      await publisherJob.execute();
    }
    console.log('[RunOnce] ✓ Completed');
  } catch (error: any) {
    console.error('[RunOnce] Failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runOnce().catch(async (error) => {
  console.error('[RunOnce] Fatal error:', error?.message || error);
  process.exitCode = 1;
  await pool.end();
});
