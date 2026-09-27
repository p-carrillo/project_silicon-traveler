import { describe, expect, it, vi } from 'vitest';
import { EphemeralPhotoExecution } from '../../../../src/application/e2e/ephemeral-photo-execution';

describe('EphemeralPhotoExecution', () => {
  it('uses the shared core and stores only temporary buffers', async () => {
    const execute = vi.fn().mockResolvedValue({
      narrative: 'Narrative', imagePrompt: 'Prompt', imageBuffer: Buffer.from('image'), cameraMetadata: { camera: 'Leica', lens: '35mm', iso: 100, shutterSpeed: '1/100', aperture: 'f/2.8' }, revisedPrompt: 'Revised prompt', visualBrief: { category: 'movement', anchor: 'A walking route passes through A Coruña.', anchorSource: 'route', subject: 'the route', setting: 'the route through A Coruña', composition: 'forward frame', timeAndWeather: 'available light', visualConstraints: [], negativeConstraints: [], originalPrompt: 'Prompt', revisedPrompt: 'Revised prompt' },
      thumbnails: new Map([['_grid', Buffer.from('grid')], ['_hero', Buffer.from('hero')]]),
    });
    const emit = vi.fn();
    const saveAsset = vi.fn().mockReturnValueOnce('image').mockReturnValueOnce('grid').mockReturnValueOnce('hero');
    const runner = new EphemeralPhotoExecution({ execute } as never);

    const result = await runner.execute({ emit, saveAsset } as never, { placeName: 'A Coruña', country: 'Spain', region: 'Galicia', osmData: null }, 1, 1);

    expect(execute).toHaveBeenCalledOnce();
    expect(saveAsset).toHaveBeenCalledTimes(3);
    expect(result.imageAssetId).toBe('image');
    expect(result.visualBrief.revisedPrompt).toBe('Revised prompt');
    expect(emit.mock.calls.map(([event]) => event.type)).toEqual(['progress', 'result']);
  });
});
