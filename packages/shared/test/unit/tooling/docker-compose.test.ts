import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('docker-compose configuration', () => {
  it('includes api and web services for default startup', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const composePath = path.join(repoRoot, 'docker-compose.yml');
    const compose = readFileSync(composePath, 'utf8');

    expect(compose).toContain('\n  api:\n');
    expect(compose).toContain('command: sh /app/scripts/api-start.sh');
    expect(compose).toContain('\n  web:\n');
    expect(compose).toContain('command: pnpm --filter @silicon-traveler/web dev');
  });

  it('bootstraps dependencies with the app service', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const composePath = path.join(repoRoot, 'docker-compose.yml');
    const compose = readFileSync(composePath, 'utf8');

    expect(compose).toContain('command: tail -f /dev/null');
    expect(compose).toContain('test: ["CMD", "test", "-d", "/app/node_modules"]');
  });

  it('shares a node_modules volume', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const composePath = path.join(repoRoot, 'docker-compose.yml');
    const compose = readFileSync(composePath, 'utf8');

    expect(compose).toContain('node_modules:/app/node_modules');
    expect(compose).toContain('\n  node_modules:\n');
  });

  it('keeps scheduler behind a profile', () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, '../../../../..');
    const composePath = path.join(repoRoot, 'docker-compose.yml');
    const compose = readFileSync(composePath, 'utf8');

    expect(compose).toContain('\n  scheduler:\n');
    expect(compose).toContain('profiles:');
    expect(compose).toContain('- scheduler');
  });
});
