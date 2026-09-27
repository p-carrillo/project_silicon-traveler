import { describe, expect, it } from 'vitest';
import { generateCameraMetadata, selectCamera } from '../../../src/config/photographer';

describe('photographer camera metadata', () => {
  it('uses a 50mm focal length and ISO 400 for every generation seed', () => {
    for (const seed of ['A Coruna|Galicia|Spain', 'Pamplona|Navarre|Spain', 'remote-place']) {
      const camera = selectCamera(seed);
      const metadata = generateCameraMetadata(seed);

      expect(camera.lens).toBe('50mm');
      expect(metadata.lens).toBe('50mm');
      expect(metadata.iso).toBe(400);
    }
  });
});
