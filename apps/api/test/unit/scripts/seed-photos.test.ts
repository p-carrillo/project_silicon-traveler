import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

const { resolveSeedImagePaths } = require('../../../../../scripts/seed-photos.js');

describe('seed-photos local source resolution', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (tempDirs.length) {
      const dir = tempDirs.pop();
      if (dir) {
        await fs.promises.rm(dir, { recursive: true, force: true });
      }
    }
  });

  it('selects supported image files in natural sorted order', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'seed-photos-'));
    tempDirs.push(dir);

    await fs.promises.writeFile(path.join(dir, 'photo-10.png'), '');
    await fs.promises.writeFile(path.join(dir, 'photo-2.jpg'), '');
    await fs.promises.writeFile(path.join(dir, 'photo-1.webp'), '');
    await fs.promises.writeFile(path.join(dir, 'notes.txt'), '');

    const result = await resolveSeedImagePaths(2, dir);

    expect(result.imagePaths).toEqual([
      path.join(dir, 'photo-1.webp'),
      path.join(dir, 'photo-2.jpg'),
    ]);
  });

  it('throws when there are not enough local images', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'seed-photos-'));
    tempDirs.push(dir);

    await fs.promises.writeFile(path.join(dir, 'photo-1.png'), '');

    await expect(resolveSeedImagePaths(2, dir)).rejects.toThrow(
      `Not enough seed images in ${dir}. Required 2, found 1.`
    );
  });
});
