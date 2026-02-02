import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { LocalStorageAdapter } from '../../../src/adapters/local-storage.adapter';

describe('LocalStorageAdapter (integration)', () => {
  it('writes files to disk and returns URLs', async () => {
    const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
    const adapter = new LocalStorageAdapter(baseDir, '/images');

    try {
      const result = await adapter.saveImage(
        Buffer.from('content'),
        'sample.jpg',
        new Date('2025-01-02T00:00:00Z')
      );

      const fullPath = path.join(baseDir, result.path);
      const contents = await fs.readFile(fullPath, 'utf8');

      expect(contents).toBe('content');
      expect(result.url).toBe(`/images/${result.path}`);
    } finally {
      await fs.rm(baseDir, { recursive: true, force: true });
    }
  });
});
