import type { PhotoPreparationCore, PhotoPreparationCoreResult, PhotoPreparationInput } from '@silicon-traveler/photo';
import type { E2EExecutionContext } from './e2e-execution';

export interface EphemeralPhotoExecutionResult {
  imageAssetId: string;
  gridThumbnailAssetId: string;
  heroThumbnailAssetId: string;
  narrative: string;
  imagePrompt: string;
}

/** Executes the shared photo core with no repository or permanent storage port. */
export class EphemeralPhotoExecution {
  constructor(private readonly photoCore: Pick<PhotoPreparationCore, 'execute'>) {}

  async execute(
    context: E2EExecutionContext,
    input: PhotoPreparationInput,
    index: number,
    total: number
  ): Promise<EphemeralPhotoExecutionResult> {
    context.emit({ type: 'progress', index, total, data: { stage: 'preparing_photo' } });
    const prepared: PhotoPreparationCoreResult = await this.photoCore.execute(input);
    const imageAssetId = context.saveAsset({ buffer: prepared.imageBuffer, contentType: 'image/jpeg' });
    const gridThumbnail = prepared.thumbnails.get('_grid');
    const heroThumbnail = prepared.thumbnails.get('_hero');
    if (!gridThumbnail || !heroThumbnail) throw new Error('Photo preparation did not produce required thumbnails');
    const gridThumbnailAssetId = context.saveAsset({ buffer: gridThumbnail, contentType: 'image/jpeg' });
    const heroThumbnailAssetId = context.saveAsset({ buffer: heroThumbnail, contentType: 'image/jpeg' });
    const result = { imageAssetId, gridThumbnailAssetId, heroThumbnailAssetId, narrative: prepared.narrative, imagePrompt: prepared.imagePrompt };
    context.emit({ type: 'result', index, total, data: result });
    return result;
  }
}
