#!/usr/bin/env node
import { Command } from 'commander';
import { migrate } from './commands/migrate';
import { initJourney } from './commands/init-journey';
import { preparePrompts } from './commands/prepare-prompts';
import { publishSeedPoint } from './commands/publish-seed-point';
import chalk from 'chalk';

const program = new Command();

program
  .name('st')
  .description('Silicon Traveler CLI - Manage your AI photographer journey')
  .version('1.0.0');

program
  .command('migrate')
  .description('Apply database migrations')
  .action(async () => {
    try {
      await migrate();
    } catch (error) {
      console.error(chalk.red('Migration failed'));
      process.exit(1);
    }
  });

program
  .command('init-journey')
  .description('Initialize journey with first 10 route points')
  .action(async () => {
    try {
      await initJourney();
    } catch (error) {
      console.error(chalk.red('Journey initialization failed'));
      process.exit(1);
    }
  });

program
  .command('prepare-prompts')
  .description('Prepare journey photos for the next N days (same pipeline as scheduler)')
  .argument('<days>', 'Number of days to prepare')
  .option('-j, --journey-id <number>', 'Journey ID', '1')
  .option('--prompts-only', 'Generate prompts only (skip image generation)')
  .action(async (days, options) => {
    try {
      const daysValue = Number(days);
      const journeyId = Number(options.journeyId);
      await preparePrompts({ days: daysValue, journeyId, promptsOnly: Boolean(options.promptsOnly) });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) {
        message = error.message;
        if (error.stack) {
          console.error(chalk.red(`Error stack:\n${error.stack}`));
        }
      } else if (typeof error === 'object' && error !== null) {
        message = JSON.stringify(error);
      } else {
        message = String(error);
      }
      console.error(chalk.red(`Preparation failed: ${message}`));
      process.exit(1);
    }
  });

program
  .command('publish-seed-point')
  .description('Create and publish one new route point using local seed image + lorem ipsum')
  .option('-j, --journey-id <number>', 'Journey ID', '1')
  .option('--seed-index <number>', '1-based index of the seed image to use')
  .option('--seed-dir <path>', 'Seed images directory (default: .ai/pictures_seed or SEED_PHOTOS_SOURCE_DIR)')
  .option('--no-map-refresh', 'Skip POST /api/map/refresh after publishing')
  .action(async (options) => {
    try {
      const journeyId = Number(options.journeyId);
      const seedIndex = options.seedIndex !== undefined ? Number(options.seedIndex) : undefined;
      const result = await publishSeedPoint({
        journeyId,
        seedIndex,
        seedDir: options.seedDir,
        mapRefresh: options.mapRefresh !== false,
      });
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`publish-seed-point failed: ${message}`));
      process.exit(1);
    }
  });

program.parse();
