import type { PhotoPreparationCore, PhotoPreparationCoreResult, PhotoPreparationInput } from '@silicon-traveler/photo';
import type { E2EExecutionContext } from './e2e-execution';

export interface EphemeralPhotoExecutionResult {
  imageAssetId: string;
  gridThumbnailAssetId: string;
  heroThumbnailAssetId: string;
  narrative: string;
  imagePrompt: string;
  researchSummary: string;
  cameraMetadata: PhotoPreparationCoreResult['cameraMetadata'];
  revisedPrompt: string | null;
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
    let activeConnector: E2EConnector = 'research';
    const updateConnector = (connector: E2EConnector, status: E2EConnectorStatus): void => {
      activeConnector = connector;
      context.emit({ type: 'progress', index, total, data: { stage: 'connector', connector, status } });
    };
    let prepared: PhotoPreparationCoreResult;
    try {
      prepared = await this.photoCore.execute(input, {
        researchStarted: async () => updateConnector('research', 'running'),
        researched: async (researchSummary) => {
          updateConnector('research', 'success');
          context.emit({ type: 'progress', index, total, data: { stage: 'research_completed', researchSummary } });
        },
        researchSources: async (sources) => context.emit({ type: 'progress', index, total, data: { stage: 'research_sources', sources } }),
        contentGenerationStarted: async () => updateConnector('content', 'running'),
        contentGenerated: async ({ imagePrompt, narrative, cameraMetadata, translations }) => {
          updateConnector('content', 'success');
          context.emit({ type: 'progress', index, total, data: { stage: 'content_completed', imagePrompt, narrative, cameraMetadata, translations } });
        },
        imageGenerationStarted: async () => updateConnector('image', 'running'),
        imageGenerated: async () => updateConnector('image', 'success'),
        thumbnailGenerationStarted: async () => updateConnector('thumbnails', 'running'),
        thumbnailsGenerated: async () => updateConnector('thumbnails', 'success'),
      });
    } catch (error: unknown) {
      throw new E2EPhotoExecutionError(activeConnector, errorMessage(error));
    }
    const imageAssetId = context.saveAsset({ buffer: prepared.imageBuffer, contentType: 'image/jpeg' });
    const gridThumbnail = prepared.thumbnails.get('_grid');
    const heroThumbnail = prepared.thumbnails.get('_hero');
    if (!gridThumbnail || !heroThumbnail) throw new Error('Photo preparation did not produce required thumbnails');
    const gridThumbnailAssetId = context.saveAsset({ buffer: gridThumbnail, contentType: 'image/jpeg' });
    const heroThumbnailAssetId = context.saveAsset({ buffer: heroThumbnail, contentType: 'image/jpeg' });
    const result = {
      imageAssetId,
      gridThumbnailAssetId,
      heroThumbnailAssetId,
      narrative: prepared.narrative,
      imagePrompt: prepared.imagePrompt,
      researchSummary: prepared.researchSummary,
      cameraMetadata: prepared.cameraMetadata,
      revisedPrompt: prepared.revisedPrompt,
    };
    context.emit({ type: 'result', index, total, data: result });
    return result;
  }
}

export type E2EConnector = 'research' | 'content' | 'image' | 'thumbnails';
export type E2EConnectorStatus = 'running' | 'success' | 'error';
export class E2EPhotoExecutionError extends Error {
  constructor(readonly connector: E2EConnector, message: string) { super(message); }
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Photo preparation failed';
}
