#!/usr/bin/env node
import { Command } from 'commander';
import { migrate } from './commands/migrate';
import { initJourney } from './commands/init-journey';
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

program.parse();
