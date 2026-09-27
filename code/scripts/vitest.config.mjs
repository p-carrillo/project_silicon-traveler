import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const alias = {
  '@silicon-traveler/shared': path.resolve(rootDir, 'packages/shared/src'),
  '@silicon-traveler/journey': path.resolve(rootDir, 'packages/journey/src'),
  '@silicon-traveler/route': path.resolve(rootDir, 'packages/route/src'),
  '@silicon-traveler/research': path.resolve(rootDir, 'packages/research/src'),
  '@silicon-traveler/content': path.resolve(rootDir, 'packages/content/src'),
  '@silicon-traveler/image': path.resolve(rootDir, 'packages/image/src'),
  '@silicon-traveler/storage': path.resolve(rootDir, 'packages/storage/src'),
  '@silicon-traveler/photo': path.resolve(rootDir, 'packages/photo/src'),
  '@silicon-traveler/map': path.resolve(rootDir, 'packages/map/src'),
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/test/**/*.test.ts', 'apps/**/test/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  resolve: {
    alias,
  },
});
