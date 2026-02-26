import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { SharpAdapter } from '../../../src/adapters/sharp.adapter';

describe('SharpAdapter (integration)', () => {
  it('normalizes png input to jpeg', async () => {
    const pngBuffer = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 3,
        background: { r: 20, g: 20, b: 20 },
      },
    })
      .png()
      .toBuffer();

    const adapter = new SharpAdapter();
    const jpegBuffer = await adapter.toJpeg(pngBuffer);
    const metadata = await sharp(jpegBuffer).metadata();

    expect(metadata.format).toBe('jpeg');
  });

  it('generates thumbnails for provided sizes', async () => {
    const sourceBuffer = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 3,
        background: { r: 200, g: 200, b: 200 },
      },
    })
      .jpeg()
      .toBuffer();

    const adapter = new SharpAdapter();
    const thumbnails = await adapter.generate(sourceBuffer, [
      { width: 10, height: 10, suffix: '_small' },
      { width: 8, height: 8, suffix: '_tiny' },
    ]);

    expect(thumbnails.get('_small')).toBeInstanceOf(Buffer);
    expect(thumbnails.get('_tiny')).toBeInstanceOf(Buffer);
  });
});
