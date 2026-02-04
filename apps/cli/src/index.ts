#!/usr/bin/env node
import { Command } from 'commander';
import { migrate } from './commands/migrate';
import { initJourney } from './commands/init-journey';
import { preparePrompts } from './commands/prepare-prompts';
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

program.parse();
