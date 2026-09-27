import { describe, expect, it, vi } from 'vitest';
import { EphemeralPhotoExecution } from '../../../../src/application/e2e/ephemeral-photo-execution';

describe('EphemeralPhotoExecution', () => {
  it('uses the shared core and stores only temporary buffers', async () => {
    const execute = vi.fn().mockResolvedValue({
      narrative: 'Narrative', imagePrompt: 'Prompt', imageBuffer: Buffer.from('image'),
      thumbnails: new Map([['_grid', Buffer.from('grid')], ['_hero', Buffer.from('hero')]]),
    });
    const emit = vi.fn();
    const saveAsset = vi.fn().mockReturnValueOnce('image').mockReturnValueOnce('grid').mockReturnValueOnce('hero');
    const runner = new EphemeralPhotoExecution({ execute } as never);

    const result = await runner.execute({ emit, saveAsset } as never, { placeName: 'A Coruña', country: 'Spain', region: 'Galicia', osmData: null }, 1, 1);

    expect(execute).toHaveBeenCalledOnce();
    expect(saveAsset).toHaveBeenCalledTimes(3);
    expect(result.imageAssetId).toBe('image');
    expect(emit.mock.calls.map(([event]) => event.type)).toEqual(['progress', 'result']);
  });
});
