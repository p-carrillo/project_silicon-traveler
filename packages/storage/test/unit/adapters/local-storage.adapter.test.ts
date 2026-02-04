import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { LocalStorageAdapter } from '../../../src/adapters/local-storage.adapter';

const originalStorageDir = process.env.STORAGE_DIR;

afterEach(() => {
  process.env.STORAGE_DIR = originalStorageDir;
});

describe('LocalStorageAdapter (unit)', () => {
  it('uses STORAGE_DIR when baseDir is not provided', async () => {
    const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storage-env-test-'));
    process.env.STORAGE_DIR = baseDir;

    const adapter = new LocalStorageAdapter();
    const result = await adapter.saveImage(
      Buffer.from('content'),
      'sample.jpg',
      new Date('2025-01-03T00:00:00Z')
    );

    const fullPath = path.join(baseDir, result.path);
    const contents = await fs.readFile(fullPath, 'utf8');

    expect(contents).toBe('content');
    expect(result.url).toBe(`/images/${result.path}`);

    await fs.rm(baseDir, { recursive: true, force: true });
  });
});
